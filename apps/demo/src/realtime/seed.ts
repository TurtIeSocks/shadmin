export const realtimeSeed = {
  posts: [
    {
      id: 1,
      title: "Hello realtime",
      body: "Open this page in two tabs to see live updates.",
      author: "alice",
    },
    {
      id: 2,
      title: "Try editing",
      body: "Edit a post in one tab and watch the other refresh.",
      author: "bob",
    },
  ],
  comments: [{ id: 1, post_id: 1, body: "First!", author: "carol" }],
};
