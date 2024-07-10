from voiceToText import recognize_and_struct_chess_move

def a():
    move_description = recognize_and_struct_chess_move()
    if move_description:
        print(f"Parsed move: {move_description}")
        return move_description
    else:
        print("No valid move description recognized.")
        return "No valid move description recognized."