import axios from "axios";

const api = axios.create({
  //   baseURL: API_URL,
});

// if tokens are required
api.interceptors.request.use((config) => {
  // add token to headers
  return config;
});

// for retry or refresh token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // if error is 401, try to refresh token
//     if (error.response.status === 401) {
//       // refresh token logic
//       // retry original request
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
