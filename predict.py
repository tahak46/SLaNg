import sys
import pickle
import warnings

# Suppress warnings so they don't mess up the Node.js stdout
warnings.filterwarnings("ignore")

def predict(text):
    try:
        # Load the model Habiba and Ikram created
        with open("model.pkl", "rb") as file:
            model = pickle.load(file)
            
        # Make the prediction
        prediction = model.predict([text])[0]
        
        # Print ONLY the result so Node.js can read it
        print(prediction)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    # Get the text passed from the JavaScript pipeline
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        predict(input_text)
    else:
        print("Error: No text provided to predict.", file=sys.stderr)