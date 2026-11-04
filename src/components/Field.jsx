import { AssetIcon } from "./Icon";
export function Field({ label, value, onChange, type = "text", icon = "c6755.svg", error, placeholder, autoComplete, }) {
    return (<label className={`form-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <div>
        <AssetIcon file={icon} size={18}/>
        <input type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)}/>
      </div>
      {error && <small role="alert">{error}</small>}
    </label>);
}
