import { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { create, get } from "../../services/crud";
import { toast } from "react-toastify";
import PostsContainer from "../home/components/container/PostsContainer";
import CompetitionPostsHeader from "./components/CompetitionPostsHeader";
import ShareModal from "../../components/ShareModal";
import BlinkingLoadingCircles from "../../components/BlinkingLoadingCircles";
import CompetitionInfo from "./components/container/CompetitionInfo";
import PageLoading from "../../components/PageLoading";
import { usePostStore } from "../../store";
import { getDate } from "../../services/timeAndDate";

export default function CompetitionPosts() {
  const [pageLoading, setPageLoading] = useState(true);
  const [competitionInfo, setCompetitionInfo] = useState<any>({});
  const [competitionName, setCompetitionName] = useState<string>();
  const [postsLoading, setPostsLoading] = useState(false);
  const lastDate = useRef<string | null>(null);
  const lastPostId = useRef<string | null>(null);
  const lastLikesCount = useRef<string | null>(null);
  const postsLoadingRef = useRef(true);
  const posts = usePostStore((state) => state.posts);
  const addToFeed = usePostStore((state) => state.addToFeed);
  const clearPosts = usePostStore((state) => state.clearPosts);
  const [joinLoading, setJoinLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState<any>();
  const [rounds, setRounds] = useState<any>([]);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const pageSize = 10;
  const params = useParams();

  useEffect(() => {
    setCompetitionName(params.name);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearPosts();
    };
  }, []);

  useEffect(() => {
    if (competitionName) {
      getBasicInfo(competitionName);
    }
  }, [competitionName]);

  const getPosts = async (
    competitionId: string,
    round: number = 1,
    first_time: boolean = false
  ) => {
    setPostsLoading(true);
    let payload: any = {
      pageSize,
      competitionId,
      round,
    };

    if (!first_time) {
      payload = {
        ...payload,
        lastDate: lastDate.current,
        lastPostId: lastPostId.current,
        lastLikesCount: lastLikesCount.current,
      };
    }
    return get("post/feed", payload)
      .then((res) => {
        if (res.data.length === 0) {
          postsLoadingRef.current = false;
          window.removeEventListener("scroll", handleScroll);
        }
        addToFeed([...res.data]);
        lastDate.current = res.lastDate;
        lastPostId.current = res.lastPostId;
        lastLikesCount.current = res.lastLikesCount;
        setPostsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setPostsLoading(false);
        toast.error(e.response?.data?.message ?? "Error while fetching posts");
      });
  };

  const getBasicInfo = (nameInfo: string) => {
    setPageLoading(true);
    const query: any = {};
    if (queryParams.get("start_date"))
      query.start_date = queryParams.get("start_date");

    if (queryParams.get("end_date"))
      query.end_date = queryParams.get("end_date");

    get("competition/info/" + nameInfo, query)
      .then((res) => {
        setCompetitionInfo(res.data);
        setRounds(res.data?.rounds ?? []);
        setCurrentRound(res.data?.rounds?.[0] ?? null);
        setPageLoading(false);
        getPosts(res.data._id, 1, true);
      })
      .catch((e) => {
        console.log(e);
        toast.error(
          e?.response?.data?.message ?? "Error! Couldn't load competition info"
        );
        setPageLoading(false);
      });
  };

  // TODO: show confirmation dialogue

  const leaveCompetition = () => {
    setLeaveLoading(true);
    create("competition/" + competitionInfo._id + "/leave", {})
      .then((res) => {
        toast.success(res.message ?? "Competition Left");
        setCompetitionInfo((i: any) => ({ ...i, competingUser: res.data }));
        setLeaveLoading(false);
      })
      .catch((e) => {
        console.log(e);
        toast.error(
          e.response?.data?.message ?? "Error! couldn't leave competition"
        );
        setLeaveLoading(false);
      });
  };

  const joinCompetition = () => {
    setJoinLoading(true);
    create("competition/" + competitionInfo._id + "/join", {})
      .then((res) => {
        toast.success(res.message ?? "Competition joined");
        setCompetitionInfo((i: any) => ({ ...i, competingUser: res.data }));
        setJoinLoading(false);
      })
      .catch((e) => {
        console.log(e);
        toast.error(
          e.response?.data?.message ?? "Error! couldn't join competition"
        );
        setJoinLoading(false);
      });
  };

  const payForCompetition = () => {
    setPayLoading(false);
  };

  const handleScroll = async () => {
    if (
      competitionInfo &&
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 5 &&
      !postsLoadingRef.current
    ) {
      postsLoadingRef.current = true;
      await getPosts(competitionInfo._id, currentRound?.number ?? 1);
      postsLoadingRef.current = false;
    }
  };

  const onNextRoundClicked = () => {
    clearPosts();
    setPostsLoading(true);
    getPosts(competitionInfo?._id ?? "", currentRound.number + 1, true);
    setCurrentRound(rounds[currentRound.number]);
  };

  const onPreviousRoundClicked = () => {
    clearPosts();
    setPostsLoading(true);
    getPosts(competitionInfo?._id ?? "", currentRound.number - 1, true);
    setCurrentRound(rounds[currentRound.number - 2]);
  };

  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <>
      <CompetitionPostsHeader />

      <div className="page-content min-vh-100">
        <div className="content-inner pt-0">
          <div className="container bottom-content">
            <CompetitionInfo
              competition={competitionInfo}
              joinCompetition={joinCompetition}
              payForCompetition={payForCompetition}
              leaveCompetition={leaveCompetition}
              payLoading={payLoading}
              joinLoading={joinLoading}
              leaveLoading={leaveLoading}
            />

            <div className="my-4 bg-white">
              <div className="divider border-secondary divider-dashed"></div>
              <div className="d-flex w-100 px-2 align-items-center">
                {currentRound?.number > 1 && (
                  <button
                    disabled={postsLoading}
                    onClick={onPreviousRoundClicked}
                    className="btn btn-primary light rounded-circle p-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fa fa-angle-left"></i>
                  </button>
                )}
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                  <h3 className="text-center py-0 mb-0">
                    Round {currentRound?.number}
                  </h3>
                  <div className="d-flex py-1">
                    <span className="small text-center">
                      Minimum number of likes needed:&nbsp;
                      {currentRound?.min_likes ?? 0}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                    {currentRound?.start_date && (
                      <span className="small text-center">
                        Start Date: {getDate(currentRound.start_date)}
                      </span>
                    )}
                    {currentRound?.end_date && (
                      <span className="small text-center">
                        End Date: {getDate(currentRound.end_date)}
                      </span>
                    )}
                  </div>
                </div>
                {currentRound?.number < competitionInfo?.rounds_count && (
                  <button
                    disabled={postsLoading}
                    onClick={onNextRoundClicked}
                    className="btn btn-primary light rounded-circle p-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fa fa-angle-right"></i>
                  </button>
                )}
              </div>
              <div className="divider border-secondary divider-dashed"></div>
            </div>

            <PostsContainer feed={posts} showAddBtn={false} />

            {postsLoading && <BlinkingLoadingCircles />}
          </div>
        </div>
      </div>

      <ShareModal />
    </>
  );
}
