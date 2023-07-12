import Generator from "./components/Generator";
import './styles/style.sass';
import './styles/main.sass';
import './styles/wfc_params.sass';
import './styles/states_settings.sass';
import './styles/mid_panel.sass';
import './styles/image_settings.sass';
import './styles/imgs-modal.sass';
import './styles/D3_settings.sass';

let generator: Generator;

function main() {
  generator = new Generator();
}

main();