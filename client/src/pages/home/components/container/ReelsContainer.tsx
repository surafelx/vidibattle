import { useState, useRef, useEffect } from "react";
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
  ads: {
    content: any;
    displayDuration: number;
    displayInterval: number;
  }[];
}

export default function PostsContainer({
  feed,
  showAddBtn,
  ads,
}: PostContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleComment, setVisibleComment] = useState<string | null>();
  const componentRefs = useRef<{ [key: string]: HTMLElement }>({});
  const postToReport = useReportStore((state) => state.post);
  const togglePostLike = usePostStore((state) => state.togglePostLike);
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

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

  // Filter the feed to only include video posts
  const videoFeed = feed.filter((post) => post.media[0].type === "video");

  // Integrate ads into the video feed at the specified intervals
  const mixedFeed = [...videoFeed];
  ads.forEach((ad, index) => {
    const insertIndex = (index + 1) * ad.displayInterval + index;
    if (insertIndex < mixedFeed.length) {
      mixedFeed.splice(insertIndex, 0, { ...ad, isAd: true });
    } else {
      mixedFeed.push({ ...ad, isAd: true });
    }
  });

  const handleScroll = () => {
    if (!scrollEnabled) return;

    const currentScrollY = window.scrollY;

    if (
      currentScrollY > lastScrollY.current &&
      window.innerHeight + currentScrollY >= document.body.offsetHeight - 1
    ) {
      // Scrolling down
      setCurrentIndex((prevIndex) =>
        prevIndex < mixedFeed.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (currentScrollY < lastScrollY.current && currentScrollY === 0) {
      // Scrolling up
      setCurrentIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    }

    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollEnabled]);

  useEffect(() => {
    const currentPost = mixedFeed[currentIndex];
    if (currentPost?.isAd) {
      setScrollEnabled(false);
      const timer = setTimeout(() => {
        setScrollEnabled(true);
      }, currentPost.displayDuration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  if (videoFeed.length === 0) {
    return <NoPostsFound showBtn={showAddBtn ?? true} />;
  }

  return (
    <>
      <div className="post-area">
        {mixedFeed.slice(currentIndex, currentIndex + 1).map((post, index) => (
          <div
            key={post._id || `ad-${index}`}
            ref={(el) =>
              (componentRefs.current[post._id || `ad-${index}`] =
                el as HTMLElement)
            }
            className="post-container"
          >
            {post.isAd ? (
              <div className="ad-container">
                {/* Render ad content */}
                <h2>Ad</h2>
                {/* Assume ad.content contains the ad display */}
                {post.content}
              </div>
            ) : (
              <Post
                setHashtagFilter={() => {}}
                post={post}
                toggleComment={toggleComment}
                togglePostLike={likePost}
                fillScreen={true} // Add a prop to handle full screen
              />
            )}
            {!post.isAd && visibleComment === post._id && (
              <CommentsContainer post={post} />
            )}
          </div>
        ))}
      </div>

      <ReportModal reportPost={reportPost} />
    </>
  );
}
