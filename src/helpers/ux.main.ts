function setColorValues(e: Event) {
  const ele_from: HTMLInputElement = e.target as HTMLInputElement;

  const id_ele_to_modify: string = ele_from.type == "color" 
    ? ele_from.id + "-hex" 
    : ele_from.id.substring(0, ele_from.id.length - 4);
  
  const val: string = ele_from.type == "color" 
    ? ele_from.value.slice(1) 
    : "#" + ele_from.value;
  
  (document.getElementById(id_ele_to_modify) as HTMLInputElement).value = val;
}

export {
  setColorValues,
};