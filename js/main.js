'use strict';
(() => {
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }
    //クラスの定義
    //・・・ボールの動きを決める
    //・・・Ballクラスの使い方が分かる
    class Ball {
        constructor(canvas, game) {
            this.canvas = canvas;
            this.game = game;
            this.ctx = this.canvas.getContext('2d');//キャンバスに描画できるようになる
            this.x = rand(30, 250);//座標x　出現する位置がランダム
            this.y = 30;//座標y
            this.r = 10;//ボールの半径
            this.vx = rand(3, 5) * (Math.random() < 0.5 ? 1 : -1);//ボールの速さがランダム　50％の確率　
            this.vy = rand(3, 5);//ボールの速さの調整
            this.isMissed = false;
        }

        getMissedStatus() {
            return this.isMissed;
        }

        bounce() {
            this.vy *= -1;
        }

        reposition(paddleTop) {
            this.y = paddleTop - this.r;
        }


        getX() {//x座標を呼び出す　
            return this.x;
        }
        getY() {//y座標を呼び出す
            return this.y;
        }
        getR() {//半径を呼び出す
            return this.r;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            //ボールの上端が、画面下に来てしまったらアウト
            if (this.y - this.r > this.canvas.height) {
                this.isMissed = true;
            }

            if (
                this.x - this.r < 0 ||//xが0座標まで(左側)来たら（this.r を計算に入れることによって半径分も考慮している、入れないとボールが画面にめり込んでしまう）
                this.x + this.r > this.canvas.width//xが右の端に来た時
            ) {
                this.vx *= -1;//速度を反転させる
            }
            if (this.y - this.r < 0) {
                this.vy *= -1;
            }
        }

        draw() {
            if (this.game.getScore() >= 1) {
                this.drawBallchange();
                return;
            }
            this.ctx.beginPath();//線を描く
            this.ctx.fillStyle = '#fdfdfd';//塗りつぶしの色指定
            this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);//arcで円を描く。 0度から始まって360度円を描く
            this.ctx.fill();//これで描画される
        }
        drawBallchange() {
            this.ctx.beginPath();
            const g = this.ctx.createRadialGradient(
                // Canvas の中心から外へ向けてグラデーション作る
                140, 140, 10,   // 内側の円（x0, y0, r0）⇒　 0%　時点
                140, 140, 140,  // 外側の円（x1, y1, r1）⇒ 100%　時点
            );

            g.addColorStop(0, '#f00');      //   0%　赤
            g.addColorStop(0.5, '#0f0');    //  50%　緑
            g.addColorStop(1, '#00f');      // 100%　青

            this.ctx.fillStyle = g;     // 座標によって色が変化する
            this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI); // 円の座標をセット
            this.ctx.fill();    //描画する
        }
    }

    class Paddle {
        constructor(canvas, game) {
            this.canvas = canvas;
            this.game = game;
            this.ctx = this.canvas.getContext('2d');
            this.w = 120;//パドルの幅
            this.h = 16;//パドルの高さ
            this.x = this.canvas.width / 2 - (this.w / 2);//パドルの初期の座標 パドルの長さ半分を左にずらすように計算して初期位置が中心に来るようにする
            this.y = this.canvas.height - 32;//パドルの高さも含まれているので16px分浮いている
            this.mouseX = this.x;
            this.addHandler();
        }

        addHandler() {//画面上でマウスが動いたらする処理　ｘの座標を更新する
            document.addEventListener('mousemove', e => {
                this.mouseX = e.clientX;//clientX（水平方向の位置を返す）で最新の場所を取得する
            });
        }

        update(ball) {//(ball)でボールの座標を受け取っている。ゲームクラスで(this.ball)を渡しているので変数のスコープを超えてボールの座標を取得できる
            const ballBottom = ball.getY() + ball.getR();
            const paddleTop = this.y;
            const ballTop = ball.getY() - ball.getR();
            const paddleBottom = this.y + this.h;
            const ballCenter = ball.getX();
            const paddleLeft = this.x;
            const paddleRight = this.x + this.w;

            if (
                ballBottom > paddleTop &&   //ボールの下端がパドルの上端を超えていて
                ballTop < paddleBottom &&   //かつボールの上端がパドルの下端を超えない　めり込んだ時の話
                ballCenter > paddleLeft &&  //ボールの中心がパドルの左端と
                ballCenter < paddleRight    //右端の間にある
            ) {
                //ボールのvyを反転させる（-1を掛ける）
                //ボールのｙ座標をめり込まない位置まで押し上げる
                ball.bounce();
                ball.reposition(paddleTop);
                this.game.addScore();
                this.paddleShort();
            }



            const rect = this.canvas.getBoundingClientRect();
            this.x = this.mouseX - rect.left - (this.w / 2);    //ブラウザの画面の余白は引く　 (this.w / 2)でパドルの中心に来るように計算する、しないとマウスのｘ座標はパドルの一番左端の座標になってしまう。

            if (this.x < 0) {
                this.x = 0;
            }//パドルが左端に行ったらそこでパドルを止める

            if (this.x + this.w > this.canvas.width) {
                this.x = this.canvas.width - this.w;
            }//パドルが右端に行ったらそこでパドルを止める
        }

        paddleShort() {
            if (this.w === 20) {
                return;
            }
            if (this.game.getScore() % 5 === 0) {
                this.w = this.w - 20;
            }
        }


        draw() {
            this.ctx.fillStyle = '#fdfdfd';
            this.ctx.fillRect(this.x, this.y, this.w, this.h);//長方形をここで描画
        }
    }
    class Game {
        constructor(canvas) {//newされたときに1回実行される　　
            this.canvas = canvas;//変数で代入したcanvasを渡す
            this.ctx = this.canvas.getContext('2d');
            this.ball = new Ball(this.canvas, this);//クラスの変数の中に別のクラスの変数を持っている　has a 関係と言うらしい。
            this.paddle = new Paddle(this.canvas, this);//thisのみだとGameクラスの引数をパドルクラスに渡している
            this.loop();
            this.isGameOver = false;
            this.score = 0;
        }

        addScore() {//メソッドを通してパドルクラスで使えるようにする（パドルクラスで使いたくてもthis.scoreの変数のみでは数字の変化できない）
            this.score++;
        }

        getScore() {
            return this.score;
        }

        loop() {
            if (this.isGameOver) {
                return;
            }
            this.update();
            this.draw();

            requestAnimationFrame(() => {
                this.loop();
            });
        }
        update() {//位置情報を更新
            this.ball.update();
            this.paddle.update(this.ball);//ボールの座標をパドルのupdateで使えるようにするため(this.ball)を渡している。しないと変数のスコープの関係でボールの座標を取得できない

            if (this.ball.getMissedStatus()) {
                this.isGameOver = true;
            }


        }

        draw() {
            if (this.isGameOver) {
                this.drawGameOver();
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);//ボールが移動したときに軌跡が残らないようにする
            this.ball.draw();
            this.paddle.draw();
            this.drawScore();

        }

        drawGameOver() {
            this.ctx.font = '28px "Arial Black"';
            this.ctx.fillStyle = 'tomato';
            this.ctx.fillText('GAME OVER', 50, 150);
        }

        drawScore() {
            this.ctx.font = '20px Arial';

            if (this.getScore() >= 30) {
                // 文字色を赤
                this.ctx.fillStyle = '#ff0000';
            }
            else if (this.getScore() >= 20) {
                // 文字色を黄
                this.ctx.fillStyle = '#ffff00';
            }
            else {
                // 文字色を白
                this.ctx.fillStyle = '#fdfdfd';
            }

            this.ctx.fillText(this.score, 10, 25);
        }

    }

    const canvas = document.querySelector('canvas');//最初にここが実行。オブジェクトを取得
    if (typeof canvas.getContext === 'undefined') {
        return;//returnは関数の中でしか使えない アロー関数で即時関数にする（一番上で作っている）
    }

    new Game(canvas);//インスタンスを作る(canvas)を渡しているので描画処理ができる。
})();//←即時関数();ですぐ実行