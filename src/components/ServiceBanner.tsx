import Icon from "./Icon";

export default function ServiceBanner() {
  return <div className="panel limitations service-banner" role="alert"><Icon name="alert" /><div><h2>The analysis service is not running.</h2><p>Start it with: <code>uvicorn app.main:app --port 8000</code></p></div></div>;
}
