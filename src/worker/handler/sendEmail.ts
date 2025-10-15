export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  apiToken: string
) => {
  const payload = {
    from: {
      email: "noreply@test-51ndgwv6xjnlzqx8.mlsender.net",
    },
    to: [
      {
        email: to,
      },
    ],
    subject,
    text,
    html,
  };

  console.log("Sending email with payload:", JSON.stringify(payload, null, 2));
  console.log("API Token exists:", !!apiToken);

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.log("Error response body:", errorBody);
    throw new Error(
      `Failed to send email: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get("content-type");
  console.log("Content-Type:", contentType);

  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();
    console.log("Email sent successfully:", result);
    return result;
  } else {
    // Response is successful but not JSON (common for 202 Accepted responses)
    const textResult = await response.text();
    console.log("Email sent successfully (non-JSON response):", textResult);
    return { success: true, message: textResult || "Email sent successfully" };
  }
};
