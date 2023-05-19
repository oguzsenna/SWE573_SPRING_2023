import React, { useState, useEffect } from "react";
import axios from "axios";

function CommentSection({ story_id }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, [story_id]);

  async function fetchComments() {
    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/stories/${story_id}/comments/`
      );
      if (response.status === 200) {
        const authorIds = response.data.map((comment) => comment.author);
        const authorResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/usernamesbyId`,
          {
            params: { user_ids: authorIds },
          }
        );

        if (authorResponse.status === 200) {
          const authors = authorResponse.data;
          const commentsWithAuthorNames = response.data.map(
            (comment, index) => ({
              ...comment,
              author: authors[index],
            })
          );
          setComments(commentsWithAuthorNames);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/stories/comment/${story_id}`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  return (
    <div>
      <h3>Comments:</h3>
      <ul>
        {comments.map((comment, index) => (
          <li>
            <p key={index}>
              {comment.author}: {comment.content}
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment here"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CommentSection;
