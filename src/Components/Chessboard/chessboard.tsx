import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import "./chessboard.css";
import Tile from "../Tiles/tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
import { Piece, Position } from "../../models";
import Logbook from "./logbook";
interface Props {
  playMove: (piece: Piece, position: Position) => number;
  pieces: Piece[];
}

export default function Chessboard({ playMove, pieces }: Props) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [moves, setMoves] = useState<string[]>([]); 
  const chessboardRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const logs = async () =>{
      let sa : string[] = [];
      const res = await axios.post('http://localhost:4000/log');
      for(const key in res.data){
        sa.push(res.data[key]["Log"]);
      }
      setMoves(sa);
    }
    logs();
  },[])
    function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 25;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      activePiece.style.position = "absolute";
      // Clamp the piece position within the chessboard bounds
      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      } else {
        activePiece.style.left = `${x}px`;
      }

      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      } else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  async function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
      const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
      if (currentPiece) {
        const opponentPiece = pieces.find((p) => p.samePosition(new Position(x, y)));
        const success = playMove(currentPiece.clone(), new Position(x, y));

        if (success) {
          const newPosition = new Position(x, y);
          let moveNotation = "";
          if (opponentPiece) {
            moveNotation = `${currentPiece.type} takes ${opponentPiece.type} ${positionToChessNotation(newPosition)}`;
            if (currentPiece.isKing && Math.abs(grabPosition.x - x) > 1) {
              if (x === 7) {
                moveNotation="O-O";
              } 
              else if (x === 0) {
                moveNotation = "O-O-O";
              }
            }
          } 
          else {
            moveNotation = `${currentPiece.type} ${positionToChessNotation(newPosition)}`;
            if (currentPiece.isPawn && grabPosition.x!==x) {
              moveNotation += " en passant";
            }
          }
          let url = `http://localhost:4000/turns?log=${moveNotation}`;
          const response3 = await axios.get<{ output: string, error: string }>(url);
          setMoves([...moves, moveNotation]);
          //UPDATE POSITION IN DB
          url = `http://localhost:4000/push?fx=${-1}&fy=${-1}&ix=${x}&iy=${y}`;
          const response = await axios.get<{ output: string, error: string }>(url);
          url = `http://localhost:4000/push?fx=${x}&fy=${y}&ix=${currentPiece.position.x}&iy=${currentPiece.position.y}`;
          const response2 = await axios.get<{ output: string, error: string }>(url);
        }
        else{
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
  
      setActivePiece(null);
    }
  }

  //Mapping Function
  const charToIndex = (char: string): number => {
    const charMap: { [key: string]: number } = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    return charMap[char];
  }

  //Mapping Function
  const indexToIndex = (char: string): number => {
    const charMap: { [key: string]: number } = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7 };
    return charMap[char];
  }

  function selectElementsByBgImage(url : string) {
    const elements = document.getElementsByClassName('chess-piece') as HTMLCollectionOf<HTMLElement>; 
    for(let i=0;i<elements.length;i++){
      if(elements[i].style.backgroundImage==url) return elements[i];
    }
}

  const runVoiceCommand = async () => {
    try {
      const response = await axios.post<{ piece: string, from: string, to: string }>('http://localhost:5000/run-script');
      var st = response.data.toString();
      if(st=="Invalid input"){
        alert("Invalid, Please try again");
        runVoiceCommand();
        return;
      }
      const initialX = charToIndex(st[0]);
      const initialY = indexToIndex(st[1]);
      const finalX = charToIndex(st[st.length-2]);
      const finalY = indexToIndex(st[st.length-1]);
      const response2 = await axios.post(`http://localhost:4000/getElement?x=${initialX}&y=${initialY}`);
      const ele = response2.data[0]["Element"];
      const element = selectElementsByBgImage(`url("Assets/Images/${ele}.png")`);
        const chessboard = chessboardRef.current;
        if (element && element.classList.contains("chess-piece") && chessboard) {
          const x = ((initialX + 0.5) * GRID_SIZE) + chessboard.offsetLeft - GRID_SIZE / 2;
          const y = ((7 -initialY + 0.5) * GRID_SIZE) + chessboard.offsetTop - GRID_SIZE / 2;
          element.style.position = "absolute";
          element.style.left = `${x}px`;
          element.style.top = `${y}px`;
        }
        var grabPosition2 = new Position(initialX,initialY);
        if (chessboard && element) {
          const x = finalX;
          const y = finalY;
          const currentPiece = pieces.find((p) => p.samePosition(grabPosition2));
          if (currentPiece) {
            const opponentPiece = pieces.find((p) => p.samePosition(new Position(x, y)));
            const success = playMove(currentPiece.clone(), new Position(x, y));
            if (success) {
              const newPosition = new Position(x, y);
              let moveNotation = "";
              if (opponentPiece) {
                moveNotation = `${currentPiece.type} takes ${opponentPiece.type} ${positionToChessNotation(newPosition)}`;
                if (currentPiece.isKing && Math.abs(grabPosition2.x - x) > 1) {
                  if (x === 7) {
                    moveNotation="O-O";
                  } 
                  else if (x === 0) {
                    moveNotation = "O-O-O";
                  }
                }
              } 
              else {
                moveNotation = `${currentPiece.type} ${positionToChessNotation(newPosition)}`;
                if (currentPiece.isPawn && grabPosition2.x!==x) {
                  moveNotation += " en passant";
                }
              }
              let url = `http://localhost:4000/turns?log=${moveNotation}`;
              const response3 = await axios.get<{ output: string, error: string }>(url);
              setMoves([...moves, moveNotation]);
              //UPDATE POSITION IN DB
              url = `http://localhost:4000/push?fx=${-1}&fy=${-1}&ix=${x}&iy=${y}`;
              const response = await axios.get<{ output: string, error: string }>(url);
              url = `http://localhost:4000/push?fx=${x}&fy=${y}&ix=${currentPiece.position.x}&iy=${currentPiece.position.y}`;
              const response2 = await axios.get<{ output: string, error: string }>(url);
            }
            else{
              element.style.position = "relative";
              element.style.removeProperty("top");
              element.style.removeProperty("left");
              alert("This move is not possible");
            }
          }
          setActivePiece(null);
        }
        window.location.reload();
      } catch (error) {
        console.error('Error running voice command:', error);
      }
  };

  // Function to convert Position to chess notation (e.g., (4, 1) to "e2")
  const positionToChessNotation = (position: Position): string => {
    const file = String.fromCharCode(97 + position.x); // 'a' is ASCII 97
    const rank = position.y + 1;
    return `${file}${rank}`;
  };

  // Generating the chessboard grid
  let board = [];
  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, j)));
      let image = piece ? piece.image : undefined;

      let currentPiece = activePiece != null ? pieces.find(p => p.samePosition(grabPosition)) : undefined;
      let highlight = currentPiece?.possibleMoves ? currentPiece.possibleMoves.some(p => p.samePosition(new Position(i, j))) : false;

      board.push(<Tile key={`${j},${i}`} image={image} number={number} highlight={highlight} />);
    }
  }

  return (
    <div className="layout">
      <div className="board">
        <div className="ranks">
          {VERTICAL_AXIS.map((rank,index) => (
              <div key={`rank-${index}`} className="rank">
                {9-parseInt(rank)}
              </div>
            ))}
        </div>
        <div
          onMouseMove={(e) => movePiece(e)}
          onMouseDown={(e) => grabPiece(e)}
          onMouseUp={(e) => dropPiece(e)}
          id="chessboard"
          ref={chessboardRef}
        >
          {board}
        </div>
        <div className="files">
          {HORIZONTAL_AXIS.map((file,index) => (
            <div key={`file-${index}`} className="file">
              {file.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
      <div className="voice">
        <button onClick={runVoiceCommand}>
          <span>Voice Control</span>
        </button>
      </div>
      <Logbook moves={moves} />
    </div>
  );
}


