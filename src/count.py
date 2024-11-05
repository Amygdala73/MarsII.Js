import sys

def count_message_occurrences(file_name):
    try:
        with open(file_name, 'r') as file:
            text = file.read()
            # Count the occurrences of the word 'Message'
            count = text.count('Message')
            print(f"The word 'Message' appears {count} times in the file.")
    except FileNotFoundError:
        print(f"The file {file_name} does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <file_name>")
    else:
        file_name = sys.argv[1]
        count_message_occurrences(file_name)
