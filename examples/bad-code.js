// This is a terrible example file with lots of bad practices
// TODO: Refactor this entire file
// FIXME: Everything is broken

function terribleFunction() {
    console.log("Starting terrible function");
    
    if (true) {
        if (false) {
            if (1 === 1) {
                if (2 === 2) {
                    if (3 === 3) {
                        if (4 === 4) {
                            if (5 === 5) {
                                console.log("Deeply nested");
                                console.log("More logging");
                                console.log("Even more logging");
                                console.log("This is getting ridiculous");
                                console.log("I should stop");
                                console.log("But I won't");
                                console.log("Because I'm lazy");
                                console.log("And I don't care");
                                console.log("About code quality");
                                console.log("At all");
                                
                                // Magic numbers everywhere
                                for (let i = 0; i < 42; i++) {
                                    if (i > 17) {
                                        console.log("Random number: " + i);
                                    }
                                }
                                
                                // Another magic number
                                setTimeout(() => {
                                    console.log("Delayed by 3000ms");
                                }, 3000);
                                
                                // More magic numbers
                                const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                                
                                // Long function doing everything
                                array.forEach((item, index) => {
                                    console.log("Processing item " + index);
                                    
                                    if (item > 5) {
                                        if (item < 15) {
                                            if (item % 2 === 0) {
                                                console.log("Even number: " + item);
                                                
                                                // More nested logic
                                                if (item === 8) {
                                                    console.log("Special case for 8");
                                                } else if (item === 10) {
                                                    console.log("Special case for 10");
                                                } else if (item === 12) {
                                                    console.log("Special case for 12");
                                                } else if (item === 14) {
                                                    console.log("Special case for 14");
                                                }
                                            } else {
                                                console.log("Odd number: " + item);
                                            }
                                        } else {
                                            console.log("Large number: " + item);
                                        }
                                    } else {
                                        console.log("Small number: " + item);
                                    }
                                });
                                
                                // TODO: Add more functionality here
                                // FIXME: This is getting out of hand
                                // HACK: Temporary solution
                                
                                return "Success";
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log("Function completed");
}

// Another terrible function
function anotherBadFunction() {
    console.log("Another function with issues");
    
    // Magic numbers galore
    const timeout = 5000;
    const retries = 3;
    const maxItems = 100;
    const threshold = 0.8;
    
    // TODO: Implement proper error handling
    // FIXME: This is not production ready
    
    for (let i = 0; i < retries; i++) {
        console.log("Attempt " + (i + 1));
        
        if (i === 2) {
            console.log("Last attempt");
        }
    }
    
    // More console.log spam
    console.log("Processing complete");
    console.log("Results: " + maxItems);
    console.log("Threshold met: " + (threshold > 0.5));
}

// Export the mess
module.exports = {
    terribleFunction,
    anotherBadFunction
};
