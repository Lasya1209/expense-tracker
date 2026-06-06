const asyncHandler = async (fn, onError) => {
  try {
    await fn();
  } catch (err) {
    console.log(err);
    if (onError) onError(err);
  }
};

export default asyncHandler;