import React from "react";
import { ChatWidget, ChatButton, FormattedTextBlock } from "../types/chat";

interface MessageRendererProps {
  widgets: ChatWidget[];
  onButtonClick: (button: ChatButton) => void;
  isBot?: boolean;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({
  widgets,
  onButtonClick,
  isBot = false,
}) => {
  const renderFormattedText = (blocks: FormattedTextBlock[]) => {
    return blocks.map((block, index) => {
      switch (block.type) {
        case "heading": {
          const level = block.level || 3;
          const headingProps = { key: index, className: "font-bold mb-2" };

          if (level === 1) return <h1 {...headingProps}>{block.content}</h1>;
          if (level === 2) return <h2 {...headingProps}>{block.content}</h2>;
          if (level === 3) return <h3 {...headingProps}>{block.content}</h3>;
          if (level === 4) return <h4 {...headingProps}>{block.content}</h4>;
          if (level === 5) return <h5 {...headingProps}>{block.content}</h5>;
          if (level === 6) return <h6 {...headingProps}>{block.content}</h6>;
          return <h3 {...headingProps}>{block.content}</h3>;
        }
        case "paragraph":
          return (
            <p key={index} className="mb-2">
              {block.content}
            </p>
          );
        case "list": {
          const items = Array.isArray(block.content)
            ? block.content
            : [block.content];
          return (
            <ul key={index} className="list-disc list-inside mb-2 ml-4">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        case "code":
          return (
            <pre
              key={index}
              className="bg-base-200 p-3 rounded-lg mb-2 overflow-x-auto"
            >
              <code className="text-sm">{block.content}</code>
            </pre>
          );
        case "quote":
          return (
            <blockquote
              key={index}
              className="border-l-4 border-primary pl-4 italic mb-2"
            >
              {block.content}
            </blockquote>
          );
        default:
          return null;
      }
    });
  };

  const renderWidget = (widget: ChatWidget, index: number) => {
    switch (widget.type) {
      case "text":
        return (
          <div key={index} className="mb-2">
            <p className="whitespace-pre-wrap">{widget.content}</p>
          </div>
        );

      case "image":
        if (!widget.image) return null;
        return (
          <div key={index} className="mb-3">
            <div className="max-w-sm">
              <img
                src={widget.image.src}
                alt={widget.image.alt}
                className="rounded-lg w-full h-auto shadow-md"
                style={{
                  width: widget.image.width
                    ? `${widget.image.width}px`
                    : "auto",
                  height: widget.image.height
                    ? `${widget.image.height}px`
                    : "auto",
                }}
              />
              {widget.image.caption && (
                <p className="text-sm text-base-content/70 mt-1 text-center">
                  {widget.image.caption}
                </p>
              )}
            </div>
          </div>
        );

      case "buttons":
        if (!widget.buttons || widget.buttons.length === 0) return null;
        return (
          <div key={index} className="flex flex-wrap gap-2 mb-3">
            {widget.buttons.map((button) => (
              <button
                key={button.id}
                onClick={() => onButtonClick(button)}
                className={`btn btn-sm ${
                  button.style === "primary"
                    ? "btn-primary"
                    : button.style === "secondary"
                    ? "btn-soft"
                    : button.style === "accent"
                    ? "btn-accent"
                    : button.style === "ghost"
                    ? "btn-neutral"
                    : "btn-outline"
                }`}
              >
                {button.text}
              </button>
            ))}
          </div>
        );

      case "formatted":
        if (!widget.formattedText) return null;
        return (
          <div key={index} className="mb-3">
            {renderFormattedText(widget.formattedText)}
          </div>
        );

      case "file":
        if (!widget.file) return null;
        return (
          <div key={index} className="mb-3">
            <div className="card card-compact w-full max-w-sm bg-base-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📎</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{widget.file.name}</h3>
                    <p className="text-sm text-base-content/70">
                      {widget.file.type}
                      {widget.file.size &&
                        ` • ${(widget.file.size / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <a
                    href={widget.file.url}
                    download={widget.file.name}
                    className="btn btn-sm btn-primary"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case "carousel":
        if (!widget.carousel?.items) return null;
        return (
          <div key={index} className="mb-3">
            <div className="carousel carousel-center max-w-md p-4 space-x-4 bg-base-200 rounded-box">
              {widget.carousel.items.map((item, itemIndex) => (
                <div key={itemIndex} className="carousel-item">
                  <div className="card w-64 bg-base-100 shadow-xl">
                    {item.image && (
                      <figure>
                        <img
                          src={item.image.src}
                          alt={item.image.alt}
                          className="w-full h-32 object-cover"
                        />
                      </figure>
                    )}
                    <div className="card-body p-4">
                      <h2 className="card-title text-sm">{item.title}</h2>
                      {item.description && (
                        <p className="text-xs">{item.description}</p>
                      )}
                      {item.buttons && (
                        <div className="card-actions justify-end mt-2">
                          {item.buttons.map((button) => (
                            <button
                              key={button.id}
                              onClick={() => onButtonClick(button)}
                              className="btn btn-xs btn-primary"
                            >
                              {button.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "typing":
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="loading loading-dots loading-sm"></span>
              <span className="text-sm text-base-content/70">typing...</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-1 ${isBot ? "text-left" : "text-right"}`}>
      {widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
};

export default MessageRenderer;
