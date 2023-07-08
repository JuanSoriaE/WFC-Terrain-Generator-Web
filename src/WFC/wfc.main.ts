import Heap from "../types/Heap";
import Queue from "../types/Queue";

const OFFS: Array<Array<number>> = [[0, -1], [1, 0], [0, 1], [-1, 0]];

let time_to_prop: number = 0;

let states: Set<string>;
let N: number;
let M: number;
let adj_list: Map<string, Set<string>> = new Map<string, Set<string>>();
let ini_cell: Array<number>;
let ini_state: string;
let neigh_based: boolean;
let adj_offs: Array<Array<number>>;
let grid: Array<Array<Set<string>>>;
let hp: Heap = new Heap();

function prebuild() {
  // Build grid
  grid = new Array(N);
  for (let r: number = 0; r < N; r++) {
    grid[r] = new Array<Set<string>>(M);
    for (let c: number = 0; c < M; c++) {
      grid[r][c] = new Set<string>(states);
      hp.push([states.size, r, c]);
    }
  }

  // Heap
  //       entropy          r            c
  hp.push([states.size - 1, ini_cell[0], ini_cell[1]]);
  if (ini_state !== "") {
    console.log("In WFC: " + ini_state);
    
    grid[ini_cell[0]][ini_cell[1]] = new Set<string>([ini_state]);
  }
}

function propagate(r: number, c: number) {
  // Propagate constraint using Breath First Search Algorithm (BFS)
  const q: Queue<Array<number>> = new Queue();
  q.push([r, c]);

  while (!q.empty()) {
    const [cur_r, cur_c]: Array<number> = q.front() as Array<number>; q.pop();
    const poss_adj_states: Set<string> = new Set();

    // Get possible states
    grid[cur_r][cur_c].forEach(state => {
      adj_list.get(state)?.forEach(adj_state => {
        poss_adj_states.add(adj_state);
      });
    });

    // NO possible adjacent states
    const no_poss_adj_states: Set<string> = new Set();
    states.forEach(state => {
      if (!poss_adj_states.has(state)) no_poss_adj_states.add(state);
    });

    // Remove NO possilbe adjacent states from the adjacent cells
    for (const [x, y] of adj_offs) {
      const new_r: number = cur_r + x, new_c: number = cur_c + y;

      // If its not valid (out of bounce or already collapsed)
      if (Math.min(new_r, new_c) < 0 || new_r >= N || new_c >= M || grid[new_r][new_c].size == 1) continue;

      const cell: Set<string> = grid[new_r][new_c];
      const og_len: number = cell.size;

      // Check if cell has a NO possible adjacent state
      for (const no_poss_adj_state of no_poss_adj_states) {
        if (cell.has(no_poss_adj_state)) cell.delete(no_poss_adj_state);
  
        // If the cell collapse
        if (cell.size == 1) break;
      }

      if (og_len != cell.size) {
        q.push([new_r, new_c]);
        if (cell.size != 1) hp.push([cell.size, new_r, new_c]);
      }
    }
  }
}

function performeWFC() {
  // Wave Function Collapse Algorithm
  while (!hp.empty()) {
    const [e, r, c]: Array<number> = hp.top(); hp.pop();
    
    if (grid[r][c].size == 1) continue;

    // Collapse Cell
    if (neigh_based) {
      
    } else {
      const rnd_idx: number = Math.floor(grid[r][c].size * Math.random());
      const rnd_ele: string = Array.from(grid[r][c])[rnd_idx];
      grid[r][c] = new Set([rnd_ele]);
    }

    const start_time: number = performance.now();
    propagate(r, c);
    const end_time: number = performance.now();

    time_to_prop += (end_time - start_time);
  }
}

function WFC(
  ini_states: Array<string>,
  n: number,
  m: number,
  adj_list_param: Map<string, Set<string>>,
  initial_cell: Array<number> = [0, 0],
  initial_state: string,
  neighbors_based: boolean = false,
  adj_offs_param: Array<Array<number>> = OFFS) {
  
  states = new Set(ini_states);
  N = n;
  M = m;
  ini_cell = initial_cell;
  ini_state = initial_state;
  neigh_based = neighbors_based;
  adj_offs = adj_offs_param;
  adj_list = adj_list_param;
  console.time("WFC prebuild");
  prebuild();
  console.timeEnd("WFC prebuild");

  console.time("WFC performe");
  performeWFC();
  console.timeEnd("WFC performe");

  console.log("WFC Time to propagate: " + time_to_prop);
  

  return grid;
}

export default WFC;
