import { ErrorPage } from "@/components/error/ErrorPage";

const ServerError = () => {
  return <ErrorPage type="500" showRefreshButton />;
};

export default ServerError;
