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
        
        const mathString = userSlangInput.replace(/[a-zA-Z\s]+(of|find|the)\s+/ig, '').trim();
        
        // Step 2: Predict intent (Habiba/Ikram's Python model)
        let intent = ""; 
        try {
            const pythonProcess = spawnSync('python', ['predict.py', userSlangInput], { encoding: 'utf-8' });
            if (!pythonProcess.error && pythonProcess.stdout) {
                intent = pythonProcess.stdout.trim().toLowerCase();
            }
        } catch (e) {
            
        }
        
        // Step 3: Parse Expression (M Aqib's task)
        const mathAst = parseExpr(mathString);
        
        // Step 4: Solve the Math (M Aqib's task)
        let solvedAst;
        const lowerInput = userSlangInput.toLowerCase(); 
        
        if (intent.includes('deriv') || lowerInput.includes('deriv')) {
            solvedAst = symDiff(mathAst, 'x'); 
        } else if (intent.includes('integr') || lowerInput.includes('integr')) {
            solvedAst = symIntegrate(mathAst, 'x'); 
        } else {
            solvedAst = mathAst; 
        }
        
        
        const simplifiedAst = symSimplify(solvedAst);
        
        // Step 6: Convert back to standard text (Jahanzaib / M Aqib's task)
        let rawResult = symToLatex(simplifiedAst);
        
        
        rawResult = rawResult.replace(/\s+/g, '');
        
        return `🔥 Result: ${rawResult}`;

    } catch (error) {
        return `🔥 Pipeline crashed. Error: ${error.message}`;
    }
}


const userInput = process.argv[2];

if (userInput) {
    
    console.log(runSlangPipeline(userInput));
}
