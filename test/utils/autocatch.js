/**
 * Wrapper function to catch all errors and call done(err) on
 * them in unit tests.
 */
module.exports = (fn) => {
  return (done) => {
    fn(done).catch(done);
  };
};
