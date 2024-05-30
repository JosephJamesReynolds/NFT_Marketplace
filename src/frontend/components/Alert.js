const Alert = ({ message, transactionHash, variant, setShowAlert }) => {
  const alertColor =
    variant === "danger" ? "red" : variant === "success" ? "green" : "blue";

  return (
    <div
      className={`border-l-4 border-${alertColor}-500 text-${alertColor}-700 p-4`}
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <svg
            className="fill-current h-6 w-6 text-${alertColor}-500 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M2 10a8 8 0 1 0 16 0 8 8 0 0 0-16 0zm8-6a6 6 0 1 1 0 12A6 6 0 0 1 10 4zm0 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">{message}</p>
          {transactionHash && (
            <p className="text-sm">
              {transactionHash.slice(0, 6) +
                "..." +
                transactionHash.slice(60, 66)}
            </p>
          )}
        </div>
      </div>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={() => setShowAlert(false)}
      >
        <svg
          className="fill-current h-6 w-6 text-${alertColor}-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  );
};

export default Alert;
