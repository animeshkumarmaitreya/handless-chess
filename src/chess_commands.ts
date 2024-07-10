
export class ChessMove {
    piece: string;
    initialX: string;
    initialY: number;
    finalX: string;
    finalY: number;

    constructor(piece: string, initialX: string, initialY: number, finalX: string, finalY: number) {
        this.piece = 'king';
        this.initialX = 'c';
        this.initialY = 3;
        this.finalX = 'b';
        this.finalY = 3;
    }
}
