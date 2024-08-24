"use client"

export const Input = ({label  ,placeholder , onChange ,type="text"}: {
  label: string;
  placeholder: string;
  onChange: (e : any) => void;
  type?: "text" | "password"
}) => {

  return(
    <div className="">
      <div className="text-lg pt-4 pb-2">*<label>{label}{" "}<span className="text-sm">{"(required)"}</span></label></div>
      <input className="border rounded px-4 py-2 w-full border-black" type={type} placeholder={placeholder} onChange={onChange} />
    </div>
  )
}