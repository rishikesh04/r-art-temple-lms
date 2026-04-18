const testLogin = async () => {
    try {
        const email = "artrohit0110@gmail.com";
        const password = "`art`rohit0110";
        console.log(`Attempting login with ${email}`);
        
        const response = await fetch("https://r-art-temple-lms.onrender.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch failed", e);
    }
};

testLogin();
