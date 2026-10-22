import Button from "../components/Button";
import PageHeader from "../components/PageHeader";

export default function Reports() {
  return <div className="page"><PageHeader title="Reports" description="Check volume, Verdict mix, uncertainty, human agreement, and average Confidence." action={<Button secondary icon="save">Export report</Button>} /><div className="report-metrics">{[["Checks","428","+12%"],["Uncertain rate","8.2%","−1.4%"],["Human agreement","92.6%","+0.8%"],["Average Confidence","84 / 100","+2"]].map(x=><section className="panel" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]} this period</small></section>)}</div><section className="panel report-chart"><div className="panel-head"><div><span>CHECKS PER DAY</span><h2>Last 30 days</h2></div></div><div className="report-bars">{[38,54,43,68,61,72,47,56,81,74,63,88,71,79,92,68,84,76,96,83,72,89,91,78,86,94,88,102,96,110].map((v,i)=><i key={i} style={{height:`${v/1.2}%`}}/>)}</div></section></div>;
}
