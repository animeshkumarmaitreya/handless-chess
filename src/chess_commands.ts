
export class ChessMove {
    piece: string;
    initialX: string;
    initialY: number;
    finalX: string;
    finalY: number;

    constructor(piece: string, initialX: string, initialY: number, finalX: string, finalY: number) {
        this.piece = 'pawn';
        this.initialX = 'b';
        this.initialY = 2;
        this.finalX = 'b';
        this.finalY = 3;
    }
}
