import React, { useState } from "react";
import { format } from "date-fns";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useInView } from "react-intersection-observer";
import { ChessGame } from "../types";
import { ExternalLink, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface GamesListProps {
  games: ChessGame[];
  username: string;
}

const GAMES_PER_PAGE = 20;
// Use environment variable or fallback to secure localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const GamesList: React.FC<GamesListProps> = ({ games, username }) => {
  const [visibleGames, setVisibleGames] = useState(GAMES_PER_PAGE);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && visibleGames < games.length) {
        setVisibleGames((prev) =>
          Math.min(prev + GAMES_PER_PAGE, games.length)
        );
      }
    },
  });

  const handleAnalyze = async (game: ChessGame) => {
    setLoading(game.url);
    setError(null);
    try {
      // Store PGN for analysis
      sessionStorage.setItem("pgn", game.pgn);

      // Start backend analysis request and store the task ID for later polling
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        pgn: game.pgn,
      });
      if (response.data.task_id) {
        sessionStorage.setItem("task_id", response.data.task_id);
      }
      setLoading(null);
      // Immediately navigate to the analysis page
      navigate("/analysis");
    } catch (err) {
      setLoading(null);
      setError("Failed to start analysis. Please try again.");
    }
  };

  const getFinalPosition = (pgn: string): string => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      return chess.fen();
    } catch (error) {
      return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {error && (
        <div className="col-span-full p-4 bg-red-900/50 rounded-lg text-red-200 border border-red-700">
          {error}
        </div>
      )}

      {games.slice(0, visibleGames).map((game, index) => {
        const isPlayerWhite =
          game.white.username.toLowerCase() === username.toLowerCase();
        const playerSide = isPlayerWhite ? game.white : game.black;
        const opponentSide = isPlayerWhite ? game.black : game.white;
        const finalPosition = getFinalPosition(game.pgn);
        const isAnalyzing = loading === game.url;

        return (
          <div
            key={index}
            className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700"
          >
            <div className="aspect-square">
              <Chessboard
                position={finalPosition}
                boardWidth={400}
                customBoardStyle={{
                  borderRadius: "0",
                }}
                boardOrientation={isPlayerWhite ? "white" : "black"}
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    {format(new Date(game.end_time * 1000), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-400">
                    Time Control: {game.time_control}
                  </p>
                </div>
                <div className="text-sm">
                  {game.rated ? (
                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-200 rounded-full border border-yellow-700/30">
                      Rated
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-300 rounded-full border border-gray-600/30">
                      Casual
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-200">
                      {playerSide.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      Rating: {playerSide.rating}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">
                    {playerSide.result === "win" ? (
                      <span className="text-green-400">Won</span>
                    ) : playerSide.result === "lose" ? (
                      <span className="text-red-400">Lost</span>
                    ) : (
                      <span className="text-gray-400">Draw</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-200">
                      {opponentSide.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      Rating: {opponentSide.rating}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 px-4 py-3 bg-gray-800/50">
              <button
                onClick={() => handleAnalyze(game)}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:hover:text-blue-400"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Analyze Game
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
      <div ref={ref} className="col-span-full h-10" />
    </div>
  );
};
