import api from "./api";

const followService = {
  getFollowingArtists() {
    return api.get("/users/me/following");
  },
};

export default followService;
