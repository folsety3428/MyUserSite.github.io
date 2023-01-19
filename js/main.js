'use strict';

(() => {
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Ball {
        constructor(canvas) {//ローカル変数として受けっている
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
            // getContext()メソッドは、グラフィックを描画するためのメソッドやプロパティをもつオブジェクトを返す。
            this.x = rand(30, 250);
            this.y = 30;
            this.r = 10;
            this.vx = rand(3, 5) * (Math.random() < 0.5 ? 1 : -1);
            this.vy = rand(3, 5);
            this.isMissed = false;

        }

        getMissedStatus() {
            // return this.isMissed;
            return this.y - this.r > this.canvas.height//これでも動く、True False が戻される　式でもOK　return
        }

        bounce() {
            this.vy *= -1;
        }

        reposition(paddleTop) {
            this.y = paddleTop - this.r;
        }

        getX() {
            return this.x;
        }

        getY() {
            return this.y;
        }

        getR() {
            return this.r;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.y - this.r > this.canvas.height) {
                this.isMissed = true;
            }

            if (
                this.x - this.r < 0 ||
                this.x + this.r > this.canvas.width
            ) {
                this.vx *= -1;
            }

            if (
                this.y - this.r < 0
            ) {
                this.vy *= -1;
            }
        }

        draw(game) {
            this.ctx.beginPath();//パスを初期化する
            //ボールの色を変える
            if (game.getScore() >= 30) {//３０点以上ならボールの色を赤に

                // 円形グラデーションオブジェクトの初期化と取得
                const grad = this.ctx.createRadialGradient(
                    this.x, this.y, 0,      // 内側の円（x0, y0, r0）   0%　時点
                    this.x, this.y, this.r  // 外側の円（x1, y1, r1） 100%　時点
                );
                grad.addColorStop(0, '#A7D30C');    //  0%
                grad.addColorStop(0.5, '#019F62');  // 50%
                grad.addColorStop(1, 'rgba(1, 159, 98, 0)');    // 100%
                this.ctx.fillStyle = grad;  //色の設定

            } else if (game.getScore() >= 20) {
                //黄色
                this.ctx.fillStyle = '#FFFF00';
            } else {
                //デフォルトは、白
                this.ctx.fillStyle = '#fdfdfd';
            }

            this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            // ↑arc() メソッドは (x, y) を中心とし、 radius を半径とした円弧を作成します。
            // 角度は startAngle から endAngle まで、 counterclockwise で指定された向き（既定では時計回り）に描かれます。
            this.ctx.fill();
        }
    }

    class Paddle {
        constructor(canvas, game) {
            this.canvas = canvas;
            this.game = game;
            this.ctx = this.canvas.getContext('2d');
            this.w = 120;
            this.h = 16;
            this.x = this.canvas.width / 2 - (this.w / 2);
            this.y = this.canvas.height - 32;
            this.mouseX = this.x;
            this.addHandler();
        }

        addHandler() {
            document.addEventListener('mousemove', e => {
                this.mouseX = e.clientX;
            });
        }

        update(ball) {
            const ballBottom = ball.getY() + ball.getR();
            const paddleTop = this.y;
            const ballTop = ball.getY() - ball.getR();
            const paddleBottom = this.y + this.h;
            const ballCenter = ball.getX();
            const paddleLeft = this.x;
            const paddleRight = this.x + this.w;
            this.clear = false;

            if (
                ballBottom > paddleTop &&
                ballTop < paddleBottom &&
                ballCenter > paddleLeft &&
                ballCenter < paddleRight
            ) {

                if (this.game.getScore() >= 30) {//ゲームクリアを実装予定　３０でクリア予定が３０を超えて次まででやっとクリアになってしまいます。　聞く！
                    this.clear = true;
                }


                ball.bounce();
                ball.reposition(paddleTop);
                // //点数加算処理
                this.game.addScore();//明示的にしている　this


                if (this.w > 20) {//課題５点ずつ減らして２０どまり
                    if (this.game.getScore() % 5 === 0) {
                        this.w -= 20;
                        // //パドルの長さを元に戻す
                        // if (this.w < 20) {
                        //     this.w = 20;
                        // }
                    }
                }
            }

            const rect = this.canvas.getBoundingClientRect();
            this.x = this.mouseX - rect.left - (this.w / 2);

            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x + this.w > this.canvas.width) {
                this.x = this.canvas.width - this.w;
            }
        }

        draw() {
            this.ctx.fillStyle = '#fdfdfd';
            this.ctx.fillRect(this.x, this.y, this.w, this.h);

            // this.game.drawGameOver();
        }
        getClear() {//ゲッターで使うと、中身が安全　変数の中身は書き換えられない。メソッドを渡すことで
            return this.clear;//値渡し　this.scoreにしないとエラーに！　聞く！
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
            this.ball = new Ball(this.canvas);//thisアドレス渡し　参照渡し（中身が書き換えれる）　インスタンスを渡す コンストラクタに渡す , this
            this.paddle = new Paddle(this.canvas, this);//thisアドレス渡し　参照渡し（中身が書き換えれる）　インスタンスを渡す コンストラクタに渡す
            this.loop();
            this.isGameOver = false;//フラグ管理
            //スコア
            this.score = 0;//クラス変数

            this.clear = false;//フラグ管理 ゲームクリア用
        }
        getScore() {//ゲッターで使うと、中身が安全　変数の
            return this.score;//値渡し　this.scoreにしないとエラーに！　聞く！
        }

        addScore() {
            this.score += 5;
            // if(score%5===0){

            // }

        }

        loop() {
            if (this.isGameOver || this.paddle.getClear()) {//|| this.paddle.getClear()
                return;//ループの終了させて、画面を止める　止めないと、一瞬だけ表示され、げーむが続いてしまう。
            }

            this.update();
            this.draw();

            requestAnimationFrame(() => {
                this.loop();
            });
        }

        update() {
            this.ball.update();
            this.paddle.update(this.ball);

            if (this.ball.getMissedStatus() === true) {
                this.isGameOver = true;
            }
        }

        draw() {

            if (this.isGameOver) {
                this.drawGameOver();
                return;
            }
            if (this.paddle.getClear()) {
                this.drawClear();//書いてから止める
                return;//この関数を終了する　以下を実行しない　画面の更新を止める
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ball.draw(this);
            this.paddle.draw();
            this.drawScore();
        }
        drawGameOver() {
            this.ctx.font = '28px "Arial Black"';//2単語時　はスペースを入れて"""
            this.ctx.fillStyle = 'tomato';
            this.ctx.fillText('GAME OVER', 50, 150);
        }
        drawScore() {//点数処理　の描画
            this.ctx.font = '20px Arial';//1単語時は　'

            //点数の色を変える

            if (this.score >= 30) {//３０点以上ならボールの色を赤に
                this.ctx.fillStyle = '#FF0000';

            } else if (this.score >= 20) {//黄色
                this.ctx.fillStyle = '#FFFF00';
            } else {//デフォルトは、白
                this.ctx.fillStyle = '#fdfdfd';
            }


            this.ctx.fillText(this.score, 10, 25);//ベースラインが下のほうにあるのでy座標が上に挙げる必要がある
        }

        drawClear() {//ゲームクリア時の描写
            this.ctx.font = '28px "Arial Black"';//2単語時　はスペースを入れて"""
            this.ctx.fillStyle = 'tomato';
            this.ctx.fillText('GAME CLEAR', 50, 150);
        }


    }

    const canvas = document.querySelector('canvas');
    if (typeof canvas.getContext === 'undefined') {
        return;
    }

    new Game(canvas);
})();