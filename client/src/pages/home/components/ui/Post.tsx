import { env } from "../../../../env";
import timeAgo from "../../../../services/timeAndDate";

export default function Post({ post }: { post: any }) {
  return (
    <>
      <div className="post-card">
        <div className="top-meta">
          <div className="d-flex justify-content-between align-items-start">
            <a href="user-profile.html" className="media media-40">
              {/* TODO: add default profile image incase profile image doesn't exist */}
              <img className="rounded" src={post.author?.profile_img} alt="/" />
            </a>
            <div className="meta-content ms-3">
              <h6 className="title mb-0">
                <a href="user-profile.html">
                  {post.author?.first_name + " " + post.author?.last_name}
                </a>
              </h6>
              <ul className="meta-list">
                {/* <li>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.25 5.83331C12.25 9.91665 7 13.4166 7 13.4166C7 13.4166 1.75 9.91665 1.75 5.83331C1.75 4.44093 2.30312 3.10557 3.28769 2.121C4.27226 1.13644 5.60761 0.583313 7 0.583313C8.39239 0.583313 9.72774 1.13644 10.7123 2.121C11.6969 3.10557 12.25 4.44093 12.25 5.83331Z"
                      stroke="black"
                      strokeOpacity="0.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 7.58331C7.9665 7.58331 8.75 6.79981 8.75 5.83331C8.75 4.86681 7.9665 4.08331 7 4.08331C6.0335 4.08331 5.25 4.86681 5.25 5.83331C5.25 6.79981 6.0335 7.58331 7 7.58331Z"
                      stroke="black"
                      strokeOpacity="0.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Bangkok, Thailand
                </li> */}
                <li>{timeAgo(post.createdAt)}</li>
              </ul>
            </div>
          </div>
          <a
            href="javascript:void(0);"
            className="item-content item-link"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasBottom1"
            aria-controls="offcanvasBottom"
          >
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.7566 4.93237L9.60021 0.182841C9.14886 -0.23294 8.4375 0.104591 8.4375 0.750465V3.25212C3.73157 3.30959 0 4.31562 0 9.07267C0 10.9927 1.1596 12.8948 2.4414 13.8893C2.84139 14.1996 3.41145 13.8101 3.26397 13.3071C1.93553 8.77542 3.89405 7.57236 8.4375 7.50264V10.25C8.4375 10.8969 9.14942 11.2329 9.60021 10.8176L14.7566 6.06761C15.0809 5.7688 15.0814 5.23158 14.7566 4.93237Z"
                fill="#E4BEAB"
              />
            </svg>
          </a>
        </div>
        <p className="text-black">{post.caption}</p>
        <div className="dz-media">
          {post.media?.[0]?.type === "image" && (
            <img
              style={{
                width: "auto",
                maxWidth: "100%",
                height: "auto",
                minHeight: "200px",
                maxHeight: "600px",
                objectFit: "contain",
              }}
              src={`${env.VITE_API_URL}/media/${post.media?.[0]?.filename}`}
              alt="/"
            />
          )}
          {post.media?.[0]?.type === "video" && (
            <video
              poster={
                post.media?.[0]?.thumbnail?.filename
                  ? `${env.VITE_API_URL}/media/${post.media?.[0]?.thumbnail?.filename}`
                  : undefined
              }
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
                src={`${env.VITE_API_URL}/media/${post.media?.[0]?.filename}`}
                type={post.media?.[0]?.contentType}
              />
            </video>
          )}
          {/* <img src="/assets/images/post/pic1.png" alt="/" /> */}
          <div className="post-meta-btn">
            <ul>
              <li>
                <a href="javascript:void(0);" className="action-btn bg-primary">
                  <i className="fa-regular fa-heart fill-icon"></i>
                  <i className="fa-solid fa-heart fill-icon-2"></i>
                  <h6 className="font-14 mb-0 ms-2" id="value1">
                    {post.likes_count ?? 0}
                  </h6>
                </a>
              </li>
              <li>
                <a href="comment.html" className="action-btn bg-secondary">
                  <i className="fa-solid fa-comment fill-icon"></i>
                  <h6 className="font-14 mb-0 ms-2">
                    {post.comments_count ?? 0}
                  </h6>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
