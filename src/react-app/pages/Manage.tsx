import React, { useState, useEffect } from "react";
import { useSubmitApproval, useWorkflows } from "../api/workflowsApi";

// Types for the workflow context
interface WorkflowContext {
  metadata: {
    workflowType: string;
    initiator: {
      type: string;
      agentId: string;
    };
  };
  payload: {
    uiSchema: {
      title: string;
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
    uiData: Record<string, any>;
  };
  humanInteraction: {
    recipient: {
      userId: string;
      channel: string;
    };
    deadline: string;
    response: {
      comments: string | null;
      decision: string;
      submittedAt: string | null;
    };
  };
  eventLog: Array<{
    eventType: string;
    timestamp: string;
    details: Record<string, any>;
  }>;
}

// Dynamic form field component
const DynamicFormField: React.FC<{
  name: string;
  schema: any;
  value: any;
  onChange: (name: string, value: any) => void;
}> = ({ name, schema, value, onChange }) => {
  const { type, title, readOnly, enum: enumValues } = schema;
  // console.log("name", name, schema);
  const isTextarea = schema["ui:widget"] === "textarea";

  if (readOnly) {
    return (
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">{title}</span>
        </label>
        <div className="input input-bordered bg-base-200 cursor-not-allowed">
          {type === "number" ? `₹ ${value}` : value}
        </div>
      </div>
    );
  }

  if (enumValues) {
    return (
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">{title}</span>
        </label>
        <select
          id={name}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Select an option</option>
          {enumValues.map((option: string) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (isTextarea) {
    return (
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">{title}</span>
        </label>
        <textarea
          id={name}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className="textarea textarea-bordered h-24"
          placeholder={`Enter ${title.toLowerCase()}...`}
        />
      </div>
    );
  }

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">{title}</span>
      </label>
      <input
        id={name}
        type={type === "number" ? "number" : "text"}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="input input-bordered w-full"
        placeholder={`Enter ${title.toLowerCase()}...`}
      />
    </div>
  );
};

// Main workflow card component
const WorkflowCard: React.FC<{
  context: WorkflowContext;
  workflowId: string;
}> = ({ context, workflowId }) => {
  const { metadata, payload, humanInteraction } = context;
  const { mutate } = useSubmitApproval();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with existing data
    // console.log("payload", context);
    setFormData({ ...payload.uiData });
  }, [payload?.uiData]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const { required = [] } = payload.uiSchema;

    required.forEach((field) => {
      if (!formData[field]) {
        newErrors[
          field
        ] = `${payload.uiSchema.properties[field].title} is required`;
      }
    });

    // Custom validation for denial notes
    if (formData.decision === "DENY" && !formData.manager_notes?.trim()) {
      newErrors.manager_notes = "Notes are required when denying an expense";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("form", formData, humanInteraction?.response?.decision);
    // return;
    // if current state is interaction completed, do not allow resubmission
    if (humanInteraction?.response?.decision !== "PENDING") {
      alert("This request has already been completed.");
      return;
    }
    if (validateForm()) {
      const submitData = {
        workflowId,
        // approved: formData.decision === "APPROVE",
        eventType: "HUMAN_ACTION_SUBMITTED",
        notes: formData.manager_notes,
        initiatedBy: humanInteraction.recipient.userId,
        state: "HUMAN_ACTION_COMPLETED",
        decision: formData.decision,
        submittedAt: new Date().toISOString(),
      };

      console.log("Form submitted:", submitData);

      // Submit to API using the mutation
      mutate(submitData, {
        onSuccess: () => {
          // alert("Decision submitted successfully!");
        },
        onError: (error) => {
          console.error("Submission error:", error);
          alert("Failed to submit decision. Please try again.");
        },
      });
    }
  };

  const handleRollback = (e: React.FormEvent) => {
    e.preventDefault();
    if (humanInteraction?.response?.decision === "PENDING") {
      alert("This request is still pending.");
      return;
    }
    // if (validateForm()) {
    const rollbackData = {
      workflowId,
      eventType: "HUMAN_ACTION_ROLLED_BACK",
      initiatedBy: humanInteraction.recipient.userId,
      state: "REQUESTED",
      decision: "PENDING",
      submittedAt: null,
    };
    mutate(rollbackData, {
      onSuccess: () => {
        // alert("Request rolled back successfully!");
      },
      onError: (error) => {
        console.error("Rollback error:", error);
        alert("Failed to rollback request. Please try again.");
      },
    });
    // }
  };

  const getDeadlineStatus = () => {
    const now = new Date();
    const deadline = new Date(humanInteraction.deadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft < 0)
      return {
        status: "overdue",
        text: "Overdue",
        className: "badge badge-error",
      };
    if (hoursLeft < 24)
      return {
        status: "urgent",
        text: `${Math.round(hoursLeft)}h left`,
        className: "badge badge-warning",
      };
    return {
      status: "normal",
      text: `${Math.round(hoursLeft / 24)}d left`,
      className: "badge badge-success",
    };
  };

  const deadlineInfo = getDeadlineStatus();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h2 className="card-title text-2xl">{payload.uiSchema.title}</h2>
          <div className="flex flex-col items-end gap-2">
            <div className="badge badge-outline">
              {metadata.workflowType.replace(/_/g, " ")}
            </div>
            <div className={deadlineInfo.className}>{deadlineInfo.text}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(payload.uiSchema.properties).map(
            ([fieldName, fieldSchema]) => (
              <div key={fieldName}>
                <DynamicFormField
                  name={fieldName}
                  schema={fieldSchema}
                  value={formData[fieldName]}
                  onChange={handleFieldChange}
                />
                {errors[fieldName] && (
                  <div className="text-error text-sm mt-1 ml-1">
                    {errors[fieldName]}
                  </div>
                )}
              </div>
            )
          )}

          <div className="card-actions justify-end pt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={humanInteraction?.response?.decision !== "PENDING"}
            >
              Submit Decision
            </button>
            <button
              type="button"
              onClick={handleRollback}
              disabled={humanInteraction?.response?.decision === "PENDING"}
              className="btn btn-outline"
            >
              Rollback
            </button>
          </div>
        </form>

        <div className="divider"></div>

        <div className="flex justify-between text-sm opacity-70">
          <div>
            Assigned to:{" "}
            <span className="font-semibold">
              {humanInteraction.recipient.userId}
            </span>
          </div>
          <div>Initiated by: {metadata.initiator.agentId}</div>
        </div>
      </div>
    </div>
  );
};

export const Manage = () => {
  const { data, isLoading, error } = useWorkflows();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-3 text-lg">Loading workflows...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading workflows: {error.message}</span>
        </div>
      </div>
    );
  }

  const workflows = data || [];
  // console.log("workflow", data);
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Workflow Management
        </h1>
        <p className="text-base-content/70 mt-2">
          Manage and respond to pending workflow requests
        </p>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl opacity-20 mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No workflows found</h3>
          <p className="text-base-content/70">
            There are currently no pending workflows to review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {workflows.map((workflow: any, index: number) => {
            try {
              let context: WorkflowContext;
              try {
                context = JSON.parse(workflow.contextData);
              } catch (error) {
                context = workflow.contextData;
              }
              return (
                <WorkflowCard
                  key={workflow.workflowId || index}
                  context={context}
                  workflowId={workflow.workflowId || `workflow-${index}`}
                />
              );
            } catch (parseError) {
              return (
                <div key={index} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="alert alert-error">
                      <span>Error parsing workflow data</span>
                      {/* log parse error */}

                      {parseError instanceof Error
                        ? parseError.message
                        : String(parseError)}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
