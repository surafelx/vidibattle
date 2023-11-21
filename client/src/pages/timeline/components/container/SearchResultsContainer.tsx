import { useNavigate } from "react-router-dom";
import BlinkingLoadingCircles from "../../../../components/BlinkingLoadingCircles";
import DisplayModeBtns from "../../../../components/DisplayModeBtns";
import {
  formatResourceURL,
  handleProfileImageError,
} from "../../../../services/asset-paths";
import { getName } from "../../../../services/utils";

export default function SearchResultsContainer({
  users,
  loading,
  showMoreBtn,
  loadMore,
  closeSearchResults,
}: {
  users: any[];
  loading: boolean;
  showMoreBtn: boolean;
  loadMore: () => void;
  closeSearchResults: () => void;
}) {
  const navigate = useNavigate();

  if (users.length === 0 && !loading) {
    return (
      <>
        <h3 className="text-muted py-5 text-center">No Users Found</h3>
        <button
          className="btn light btn-dark mt-2 w-100"
          onClick={closeSearchResults}
        >
          <span>Close</span>
        </button>
      </>
    );
  }

  if (users.length === 0 && loading) {
    return <BlinkingLoadingCircles />;
  }

  return (
    <>
      <div className="title-bar m-0">
        <h6 className="mb-0">Search Results</h6>
        <div className="dz-tab style-2">
          <DisplayModeBtns listMode={true} />
        </div>
      </div>
      <div className="tab-content" id="myTab3Content">
        <div
          className="tab-pane fade"
          id="grid2"
          role="tabpanel"
          aria-labelledby="grid-tab"
        >
          <div className="dz-user-list row g-2">
            {users.map((user: any) => (
              <div key={user._id} className="col-6">
                <div
                  style={{ cursor: "pointer" }}
                  className="user-grid"
                  onClick={() => navigate("/profile/" + user.username)}
                >
                  <a className="media status media-60">
                    <img
                      src={formatResourceURL(user.profile_img)}
                      onError={handleProfileImageError}
                      alt="/"
                    />
                  </a>
                  <a className="name">{getName(user)}</a>
                  <div className="small mb-3">
                    <span style={{ color: "#555" }}>@{user.username}</span>
                    <span className="text-black">{" | "}</span>
                    <span style={{ color: "#555" }}>
                      {user.followers_count} Followers
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="tab-pane fade show active"
          id="list2"
          role="tabpanel"
          aria-labelledby="list-tab"
        >
          <div className="dz-user-list row g-3">
            {users.map((user: any) => (
              <div key={user._id} className="col-12">
                <div
                  className="user-grid style-2"
                  onClick={() => navigate("/profile/" + user.username)}
                >
                  <a
                    style={{ cursor: "pointer" }}
                    className="d-flex align-items-center"
                  >
                    <div className="media status media-50">
                      <img
                        src={formatResourceURL(user.profile_img)}
                        onError={handleProfileImageError}
                        alt="/"
                      />
                    </div>
                    <div className="d-flex justify-content-start flex-column">
                      <span
                        className="name"
                        style={{
                          paddingLeft: "0px",
                          paddingRight: "0px",
                          textAlign: "left",
                        }}
                      >
                        {getName(user)}
                      </span>
                      <div
                        className="small"
                        style={{ textAlign: "left", marginLeft: "15px" }}
                      >
                        <span style={{ color: "#555" }}>@{user.username}</span>
                        <span className="text-black">{" | "}</span>
                        <span style={{ color: "#555" }}>
                          {user.followers_count} Followers
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="tab-pane fade show active"
          id="list2"
          role="tabpanel"
          aria-labelledby="list-tab"
        >
          <div className="dz-user-list row g-3 py-3">
            {showMoreBtn && users.length > 0 && (
              <button
                className={`btn light btn-primary ${loading && "disabled"}`}
                onClick={loadMore}
              >
                {!loading && <span>show more</span>}
                {loading && <i className="fa fa-spinner fa-spin"></i>}
              </button>
            )}
            {users.length === 0 && loading && <BlinkingLoadingCircles />}

            <button
              className="btn light btn-dark mt-3"
              onClick={closeSearchResults}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
