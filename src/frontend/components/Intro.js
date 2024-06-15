import React from "react";

const Intro = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="mb-5">
        {" "}
        <h1 className="text-4xl mb-8">
          {" "}
          Wanna get started? Watch the video below.
        </h1>
        <iframe
          className="border-2 border-gray-400"
          width="750"
          height="500"
          src="https://www.youtube.com/embed/nIaH8G0XUhU"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <a
        href="https://youtu.be/Ya4aLRYMHAI"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
      >
        Watch my other video
      </a>
    </div>
  );
};

export default Intro;
