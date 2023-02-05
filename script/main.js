document.addEventListener("DOMContentLoaded", function () {
  const cells = document.querySelectorAll(".cell");
  const start_btns = document.querySelectorAll(".start__btn");
  const turn_text = document.querySelector(".turn_text");
  const game_before_content = document.querySelector(".game_before");
  const marubatsu = new MarubatsuGame(cells, turn_text, game_before_content);
  start_btns.forEach((btn, index) => {
    // 先攻、後攻ボタン押下時
    btn.addEventListener("click", function () {
      marubatsu.gameStart(index);
    });
  });

  cells.forEach((cell, index) => {
    // マルバツエリア選択時
    cell.addEventListener("click", () => {
      marubatsu.cellClick(cell, index);
    });
  });
});

class MarubatsuGame {
  constructor(cells, turn_text, game_before_content) {
    this.cells = cells;
    this.cnt = 0;
    this.player_flg = true;
    this.game_start_flg = false;
    this.player_symbol = "";
    this.npc_symbol = "";
    this.npc_choice = "";
    this.turn_text = turn_text;
    this.game_before_content = game_before_content;
    this.turn_texts = [
      "あなたの番です。",
      "コンピューターの番です。",
      "あなたの勝利です。",
      "コンピューターの勝利です。",
      "引き分けです。",
    ];
    this.player_choices = [];
    this.npc_choices = [];
    this.clear_choices = [
      [0, 1, 2],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
  }

  gameStart(index) {
    // ゲームの初期化
    this.cells.forEach((cell) => {
      cell.innerText = null;
    });
    this.player_choices = [];
    this.npc_choices = [];
    this.cnt = 0;
    this.game_before_content.classList.add("visibility_hidden");
    this.game_start_flg = true;
    // 先攻の場合
    if (index === 0) {
      this.turn_text.innerText = this.turn_texts[0];
      this.player_flg = true;
      this.player_symbol = "○";
      this.npc_symbol = "×";
    // 後攻の場合
    } else {
      this.turn_text.innerText = this.turn_texts[1];
      this.player_flg = false;
      this.player_symbol = "×";
      this.npc_symbol = "○";
      // コンピューターの処理呼び出し
      setTimeout(function () {
        this._npc_turn();
      }.bind(this), 1000);
    }
  }

  cellClick(cell, index) {
    // ゲーム開始前、コンピューターの番、選択済箇所の場合、処理を実行しない
    if (!this.game_start_flg || !this.player_flg || cell.innerText != "") {
      return;
    }
    cell.innerText = this.player_symbol;
    this.player_choices.push(index);
    this.cnt++;

    // 3つ揃わなかった場合
    if (!this._choices_check(this.player_choices, false)) {
      // 引き分けの場合
      if (this.cnt === 9) {
        this._game_finish(4);
      } else {
        this.turn_text.innerText = this.turn_texts[1];
        this.player_flg = !this.player_flg;
        // コンピューターの処理呼び出し
        setTimeout(function () {
          this._npc_turn();
        }.bind(this),1000);
      }
    }
  }

  _npc_turn() {
    // NPCが2つまで揃っている場合
    if (this._choices_check(this.npc_choices, true)) {
      this.cells[this.npc_choice].innerText = this.npc_symbol;
    // プレイヤーが2つまで揃っている場合
    } else if (this._choices_check(this.player_choices, true)) {
      this.cells[this.npc_choice].innerText = this.npc_symbol;
    } else {
      this._random_choice();
    }
    this.cells[this.npc_choice].innerText = this.npc_symbol;
    this.turn_text.innerText = this.turn_texts[0];
    this.cnt++;
    this.npc_choices.push(this.npc_choice);

    // 3つ揃わなかった場合
    if (!this._choices_check(this.npc_choices, false)) {
      this.player_flg = !this.player_flg;
      // 引き分けの場合
      if (this.cnt === 9) {
        this._game_finish(4);
      }
    }
  }

  _random_choice() {
    let p_flg = false;
    while (!p_flg) {
      this.npc_choice = Math.floor(Math.random() * 9);
      if (this.cells[this.npc_choice].innerText === "") {
        this.cells[this.npc_choice].innerText = this.npc_symbol;
        p_flg = true;
      }
    }
  }

  _compareFunc(a, b) {
    return a - b;
  }

  _choices_check(choices, npc_choice_flg) {
    let game_set = false;
    this.npc_choice = "";
    // 昇順に並び替え
    choices.sort(this._compareFunc);
    // 正解の配列の塊の数だけ繰り返し
    for (let i = 0; i < this.clear_choices.length; i++) {
      let hold_correct_answer = [];
      if (game_set) {
        break;
      }
      // i番目の配列の数だけ繰り返し
      for (let j = 0; j < this.clear_choices[i].length; j++) {
        if (game_set) {
          break;
        }
        // 引数の配列をfor文で回す
        for (let k = 0; k < choices.length; k++) {
          // 正解の配列と選択した配列が同じ場合
          if (this.clear_choices[i][j] == choices[k]) {
            hold_correct_answer.push(choices[k]);
            // 3つ記号が揃った場合
            if (hold_correct_answer.length == 3) {
              // プレイヤーの番の場合
              if (this.player_flg) {
                this._game_finish(2);
              } else {
                this._game_finish(3);
              }
              game_set = true;
              break;
            // NPCが選択考慮中かつ、２つ揃っている場合
            } else if (hold_correct_answer.length == 2 && npc_choice_flg) {
              let last_one = this.clear_choices[i].filter((n) => choices.indexOf(n) == -1)[0];
              if (this.cells[last_one].innerText === "") {
                this.npc_choice = last_one;
                game_set = true;
              }
            }
          }
        }
      }
    }
    return game_set;
  }

  _game_finish(turn_text_index) {
    this.turn_text.innerText = this.turn_texts[turn_text_index];
    this.game_start_flg = false;
    this.game_before_content.classList.remove("visibility_hidden");
  }
}
