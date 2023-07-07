function setStatesInputs(states: Array<string>, div_form: HTMLDivElement) {
  div_form.innerHTML = "";

  for (let i: number = 0; i < states.length; i++) {
    const state: string = states[i];
    const adj_vals_arr: Array<string> = [];
    
    for (let j: number = -1; j < 2; j++) {
      if (i + j >= 0 && i + j < states.length) adj_vals_arr.push(states[i + j]);
    }

    const new_ele_str: string = `
      <div class="table-row">
        <div class="table-cell state">${state}</div>
        <div class="table-cell adj inp table-cell-state-${state}-adj">
          <input type="text" id="state-${state}-adj" value="${adj_vals_arr.join()}">
        </div>
        <div class="table-cell color inp table-cell-state-${state}-color table-cell-state-${state}-color-hex">
          <input type="text" id="state-${state}-color-hex">
          <div class="cell-color-div">
            <div class="color-inp-container">
              <input type="color" id="state-${state}-color">
            </div>
          </div>
        </div>
      </div>
    `;

    const temp_ele: HTMLDivElement = document.createElement("div");
    temp_ele.innerHTML = new_ele_str;

    const new_ele: HTMLDivElement = temp_ele.querySelector(".table-row") as HTMLDivElement;
    const color_ele: HTMLInputElement = new_ele.querySelector(`#state-${state}-color`) as HTMLInputElement;
    const hex_ele: HTMLInputElement = new_ele.querySelector(`#state-${state}-color-hex`) as HTMLInputElement;

    color_ele.addEventListener("change", setColorValues);
    hex_ele.addEventListener("change", setColorValues);
    hex_ele.value = color_ele.value.slice(1);
    
    div_form.appendChild(new_ele);
    
    const adj_inp: HTMLInputElement = new_ele.querySelector(`#state-${state}-adj`) as HTMLInputElement;
    const color_inp: HTMLInputElement = new_ele.querySelector(`#state-${state}-color`) as HTMLInputElement;
    const color_inp_hex: HTMLInputElement = new_ele.querySelector(`#state-${state}-color-hex`) as HTMLInputElement;

    [adj_inp, color_inp, color_inp_hex].forEach(ele => {
      ele.addEventListener("focus", handleInputFocusTable);
      ele.addEventListener("keydown", e => handleMoveDown(e, i, states));
    });

    [adj_inp, color_inp, color_inp_hex].forEach(ele => {
      ele.addEventListener("focusout", handleInputFocusoutTable);
    });
  }
}

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

function handleInputFocusTable(e: Event) {
  const ele: HTMLInputElement = e.target as HTMLInputElement;
  const parent_table_cell: HTMLDivElement = document.getElementsByClassName(`table-cell-${ele.id}`)[0] as HTMLDivElement;

  parent_table_cell.style.boxShadow = "0 0 0 4px rgba(95, 122, 219, 0.3)";
}

function handleInputFocusoutTable(e: Event) {
  const ele: HTMLInputElement = e.target as HTMLInputElement;
  const parent_table_cell: HTMLDivElement = document.getElementsByClassName(`table-cell-${ele.id}`)[0] as HTMLDivElement;

  parent_table_cell.style.boxShadow = "";
}

function handleMoveDown(e: KeyboardEvent, i: number, states: Array<string>) {
  if ((e.code != "ArrowUp" && e.code != "ArrowDown") 
    || (i == states.length - 1  && e.code == "ArrowDown") 
    || (i == 0 && e.code == "ArrowUp")) return;
  e.preventDefault();

  const add_up: number = e.code == "ArrowUp" ? -1 : 1;
  const second_idx: number = (e.target as HTMLInputElement).id.indexOf("-", 6);
  const inp_type: string = (e.target as HTMLIFrameElement).id.substring(second_idx + 1);
  
  (document.getElementById(`state-${states[i + add_up]}-${inp_type}`))?.focus();
}

function openImgModal(title: string, description: string, src: string) {
  (document.getElementById("img-modal-title") as HTMLHeadingElement).textContent = title;
  (document.getElementById("img-modal-description") as HTMLHeadingElement).textContent = description;
  (document.getElementById("img-modal-img") as HTMLImageElement).src = src;
  (document.getElementById("img-modal-img") as HTMLImageElement).alt = description;

  if (src == "") {
    (document.getElementById("img-modal-img") as HTMLImageElement).src = "./public/imgs/havent-generated.svg";
  }

  (document.getElementById("img-modal-container") as HTMLDivElement).style.display = "flex";
}

function closeImgModal() {
  (document.getElementById("img-modal-container") as HTMLDivElement).style.display = "none";
}

function animateGenerating() {
  (document.getElementById("loading-modal-container") as HTMLDivElement).style.display = "flex";

  const generating_txt: HTMLHeadingElement = document.getElementById("loading-modal-text") as HTMLHeadingElement;

  setInterval(() => {
    if (generating_txt.textContent?.length == "Generating...".length) {
      generating_txt.textContent = "Generating";
    } else {
      generating_txt.textContent += ".";
    }
  }, 465);
}

function stopAnimateGenerating() {
  (document.getElementById("loading-modal-container") as HTMLDivElement).style.display = "none";
}

export {
  setStatesInputs,
  setColorValues,
  closeImgModal,
  openImgModal,
  animateGenerating,
  stopAnimateGenerating,
};