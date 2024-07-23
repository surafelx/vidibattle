import { useEffect, useState, useRef } from "react";
import Post from "../ui/Post";
import CommentsContainer from "./CommentsContainer";
import { usePostStore, useReportStore } from "../../../../store";
import { create } from "../../../../services/crud";
import NoPostsFound from "../../../../components/NoPostsFound";
import { isLoggedIn } from "../../../../services/auth";
import { useNavigate } from "react-router-dom";
import ReportModal from "../../../../components/ReportModal";
import { toast } from "react-toastify";

interface PostContainerProps {
  feed: any[];
  showAddBtn?: boolean;
}

const extractHashtags = (caption: string) => {
  const regex = /#[a-zA-Z0-9_]+/g;
  return caption.match(regex) || [];
};

const filterByHashtag = (feed: any[], hashtag: string) => {
  if (hashtag)
    return feed.filter((post) => {
      const hashtags: any = extractHashtags(post.caption);
      return hashtags.includes(hashtag);
    });
  return feed;
};

export default function PostsContainer({
  feed,
  showAddBtn,
}: PostContainerProps) {
  const [visibleComment, setVisibleComment] = useState<string | null>(null);
  const [hashTagFilter, setHashtagFilter] = useState<string>("");
  const [filteredFeed, setFilteredFeed] = useState<any[]>(feed);
  const componentRefs = useRef<{ [key: string]: HTMLElement }>({});
  const postToReport = useReportStore((state) => state.post);
  const togglePostLike = usePostStore((state) => state.togglePostLike);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredFeed(filterByHashtag(feed, hashTagFilter));
  }, [hashTagFilter, feed]);

  const toggleComment = (id: string) => {
    if (visibleComment === id) {
      setVisibleComment(null);
      if (componentRefs.current[id])
        componentRefs.current[id].scrollIntoView({ behavior: "smooth" });
    } else {
      setVisibleComment(id);
    }
  };

  const likePost = (id: string, liked: boolean) => {
    if (!isLoggedIn()) return navigate("/auth");

    togglePostLike(id, liked);
    if (liked) {
      create("post/like/" + id, {}).catch((e) => {
        console.log(e);
        togglePostLike(id, false);
      });
    } else {
      create("post/unlike/" + id, {}).catch((e) => {
        console.log(e);
        togglePostLike(id, true);
      });
    }
  };

  const reportPost = (comment: string) => {
    if (postToReport && comment) {
      create("report", { post: postToReport._id, comment })
        .then(() => {
          toast.success("Report Sent For Review!");
        })
        .catch((e) => {
          console.log(e);
          toast.error(
            e.response?.data?.message ?? "Error! Report Not Submitted"
          );
        });
    }
    closeReportModal();
  };

  const closeReportModal = () => {
    let btn = document.getElementById("bottomModalClose");
    if (btn) {
      btn.click();
    }
  };

  if (filteredFeed.length === 0) {
    return <NoPostsFound showBtn={showAddBtn ?? true} />;
  }

  return (
    <>
      <div className="post-area">
        {hashTagFilter && (
          <div style={{ position: "fixed" }}>
            Filtered By {`${hashTagFilter}`}
            <button onClick={() => setHashtagFilter("")}>Reset Filter</button>
          </div>
        )}
        {filteredFeed.map((post) => (
          <div
            key={post._id}
            ref={(el) => (componentRefs.current[post._id] = el as HTMLElement)}
          >
            <Post
              fillScreen={false}
              setHashtagFilter={setHashtagFilter}
              post={post}
              toggleComment={toggleComment}
              togglePostLike={likePost}
            />
            {visibleComment === post._id && <CommentsContainer post={post} />}
          </div>
        ))}
      </div>

      <ReportModal reportPost={reportPost} />
    </>
  );
}
