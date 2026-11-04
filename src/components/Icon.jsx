import { ASSETS } from "../config";
export function AssetIcon({ file, size = 22 }) {
    return (<img src={`${ASSETS}/${file}`} width={size} height={size} alt="" aria-hidden="true"/>);
}
export function StatusBadge({ status }) {
    const on = status === "on";
    return (<span className={`status-badge ${on ? "on" : "off"}`}>
      <AssetIcon file={on ? "aaf9f.svg" : "f22aa.svg"} size={18}/>
      {status === "on" ? "ON" : status === "off" ? "OFF" : "UNKNOWN"}
    </span>);
}
