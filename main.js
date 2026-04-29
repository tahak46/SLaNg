import { spawnSync } from 'child_process';
import { 
    parseExpr,      // M Aqib's math extractor
    symDiff,        // M Aqib's derivative solver
    symIntegrate,   // M Aqib's integral solver
    symSimplify,    // M Aqib's math simplifier
    symToLatex      // M Aqib's text formatter
} from './slang-math.js'; 

export function runSlangPipeline(userSlangInput) {
    try {
        // Step 1: Preprocess & Extract Math
        // This removes the English words. Example: "integral of x^2" becomes "x^2"
        const mathString = userSlangInput.replace(/[a-zA-Z\s]+(of|find|the)\s+/ig, '').trim();
        
        // Step 2: Predict intent (Habiba/Ikram's Python model)
        let intent = ""; // FIXED: Empty default so it is forced to read your text
        try {
            const pythonProcess = spawnSync('python', ['predict.py', userSlangInput], { encoding: 'utf-8' });
            if (!pythonProcess.error && pythonProcess.stdout) {
                intent = pythonProcess.stdout.trim().toLowerCase();
            }
        } catch (e) {
            // Ignoring Python errors for now so the pipeline doesn't crash during testing
        }
        
        // Step 3: Parse Expression (M Aqib's task)
        const mathAst = parseExpr(mathString);
        
        // Step 4: Solve the Math (M Aqib's task)
        let solvedAst;
        const lowerInput = userSlangInput.toLowerCase(); // Read the user's actual text
        
        if (intent.includes('deriv') || lowerInput.includes('deriv')) {
            solvedAst = symDiff(mathAst, 'x'); // Differentiate with respect to 'x'
        } else if (intent.includes('integr') || lowerInput.includes('integr')) {
            solvedAst = symIntegrate(mathAst, 'x'); // Integrate with respect to 'x'
        } else {
            solvedAst = mathAst; // If it doesn't know what to do, just return the math
        }
        
        // Step 5: Simplify the result
        const simplifiedAst = symSimplify(solvedAst);
        
        // Step 6: Convert back to standard text (Jahanzaib / M Aqib's task)
        let rawResult = symToLatex(simplifiedAst);
        
        // Clean up formatting (turns "2 x" into "2x")
        rawResult = rawResult.replace(/\s+/g, '');
        
        return `🔥 Result: ${rawResult}`;

    } catch (error) {
        return `🔥 Pipeline crashed. Error: ${error.message}`;
    }
}

// =====================================================================
// COMMAND LINE EXECUTION (Runs when you type `node main.js "..."`)
// =====================================================================
const userInput = process.argv[2];

if (userInput) {
    // Run the pipeline and print the result to the terminal!
    console.log(runSlangPipeline(userInput));
}