import React from "react";
import "./logbook.css";

interface LogbookProps {
  moves: string[];
}

const Logbook: React.FC<LogbookProps> = ({ moves }) => {
  const whiteMoves = moves.filter((_, index) => index % 2 === 0);
  const blackMoves = moves.filter((_, index) => index % 2 !== 0);

  return (
    <div className="logbook">
      <table>
        <thead>
          <tr>
            <th>Move No.</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>
          {whiteMoves.map((move, index) => (
            <tr key={index}>
              <td id='moveno'>{index + 1}</td>
              <td>{move}</td>
              <td>{blackMoves[index] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Logbook;
