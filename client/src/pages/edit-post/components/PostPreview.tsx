import { formatResourceURL } from "../../../services/asset-paths";

interface PostPreviewProps {
  caption: string;
  type: "video" | "image";
  file: { filename: string; size: number; contentType: string };
  thumbnail?: File | null;
  deleteFiles: () => void;
  onVideoLengthChanged: (duration: number) => void;
}
export default function PostPreview({
  caption,
  type,
  file,
  deleteFiles,
}: PostPreviewProps) {
  return (
    <div className="container">
      <div className="col-12">
        <div className="card card-full">
          <div className="card-header">
            <h5 className="card-title">Preview</h5>
          </div>
          <div className="card-body">
            <p className="card-text">
              {caption.length === 0 ? (
                <span className="text-muted">No Caption</span>
              ) : (
                caption
              )}
            </p>
            <div className="divider divider-dotted"></div>
            <div className="position-relative ">
              {type === "image" && file && (
                <img
                  style={{
                    width: "100%",
                    maxWidth: "900px",
                    height: "auto",
                    maxHeight: "500px",
                    objectFit: "scale-down",
                  }}
                  src={formatResourceURL(file?.filename)}
                  alt="No image found"
                />
              )}
              {type === "video" && (
                <video
                  id="videoPlayer"
                  style={{
                    width: "auto",
                    maxWidth: "100%",
                    height: "auto",
                    minHeight: "200px",
                    maxHeight: "600px",
                    objectFit: "contain",
                  }}
                  controls
                >
                  <source
                    src={formatResourceURL(file?.filename)}
                    type={file?.contentType}
                  />
                </video>
              )}
              <div className="position-absolute top-0 p-3">
                <button onClick={deleteFiles} className="btn btn-danger">
                  <i className="fa-solid fa-xmark me-2"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
