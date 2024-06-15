import React from "react";

const Intro = () => {
  return (
    <div
      className="video-container"
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video width="750" height="500" controls autoplay>
        <source src="YOUR_VIDEO_URL_HERE.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Intro;
