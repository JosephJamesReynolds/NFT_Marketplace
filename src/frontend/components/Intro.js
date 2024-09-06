import React from "react";

const Intro = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
          Wanna get started? Watch the video below.
        </h1>
        <div className="relative pb-[56.25%] h-0 overflow-hidden mb-6 sm:mb-8">
          <iframe
            className="absolute top-0 left-0 w-full h-full border-2 border-gray-400 rounded-lg"
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
          className="inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Watch my other video
        </a>
      </div>
    </div>
  );
};

export default Intro;
