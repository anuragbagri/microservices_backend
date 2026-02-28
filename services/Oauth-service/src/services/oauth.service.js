import axios from "axios";
import AppError from "../utils/AppError";
/**
 * @description functions to build the authURL
 * @param {string , object} *
 * @returns {string}
 */

const buildGoogleAuthUrl = (state) => {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const authUrlParams = new URLSearchParams({
        client_id : process.env.GOOGLE_CLIENT_ID,
        redirect_uri : process.env.GOOGLE_REDIRECT_URI,
        response_type : "code",
        scope : "openid email profile",
        state : state,
        access_type : "offline",
        prompt : "consent"
    }).toString();

    return `${baseUrl}?${authUrlParams}`;
}


const buildGithubAuthUrl = (state) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const authUrlParams = new URLSearchParams({
        client_id : process.env.GITHUB_CLIENT_ID,
        redirect_uri : process.env.GITHUB_REDIRECT_URI,
        scope: "read:user user:email",
        state : state
}); 
    return `${baseUrl}?${authUrlParams}`;
}


const exchangeGoogleCode = async(code) => {
    try {
        const makeCall = await axios.post('https://oauth2.googleapis.com/token',
        new URLSearchParams(
            {
          code,
          client_id : process.env.GOOGLE_CLIENT_ID,
          client_secret : process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri : process.env.GOOGLE_REDIRECT_URI,
          grant_type : 'authorization_code'
           }),
        {
            headers : {
                "Content-Type":"application/x-www-form-urlencoded"
            }
        }
    );

       if(!makeCall.data) {
        throw new AppError("failed to connect to url", 429);
       }
       // axios => response.data.object 
       return {
        access_token : makeCall.data.access_token,
        refresh_token : makeCall.data.refresh_token,
        expires_in : makeCall.data.expires_in,
        token_type : makeCall.data.token_type
       }
    }
    catch(err){
       if(err instanceof(AppError)){
        throw err
       }
       throw new AppError("Internal server error ", 500);
    }
}


const exchangeGithubCode = async(code) => {
    try {
        const makeCall = await axios.post('https://github.com/login/oauth/access_token',
        new URLSearchParams(
            {
          code,
          client_id : process.env.GOOGLE_CLIENT_ID,
          client_secret : process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri : process.env.GOOGLE_REDIRECT_URI,
           }),
        {
            headers : {
                Accept:"application/json"
            }
        }
    );

       if(!makeCall.data) {
        throw new AppError("failed to connect to url", 429);
       }
       // axios => response.data.object 
       return {
        access_token : makeCall.data.access_token,
        token_type : makeCall.data.token_type,
        scope : makeCall.data.scope
       }
    }
    catch(err){
       if(err instanceof(AppError)){
        throw err
       }
       throw new AppError("Internal server error ", 500);
    }
}


const getGoogleUserInfo = async(accessToken) => {
     try {
        const makeCall = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", 
        {
            headers : {
                Authorization:`Bearer ${accessToken}`
            }
        }
     );
     if(!makeCall.data){
       throw new AppError("failed to get user data from google" , 429);
     }
     return {
        sub : makeCall.data.sub,
        email : makeCall.data.email,
        name : makeCall.data.name,
        picture : makeCall.data.picture
     }
    }
    catch(err){
        if(err instanceof(AppError)){
            throw err
        }

        throw new AppError("Internal server error", 500);
    }
};

const getGithubUserInfo = async (accessToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json"
    };
    const userResponse = await axios.get(
      "https://api.github.com/user",
      { headers }
    );

    let { id, email, name, avatar_url } = userResponse.data;
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        { headers }
      );

      const primaryEmail = emailResponse.data.find(
        (e) => e.primary === true && e.verified === true
      );

      if (primaryEmail) {
        email = primaryEmail.email;
      }
    }

    return {
      id: id.toString(),
      email,
      name,
      avatar_url
    };

  } catch (err) {
    console.error("GitHub user fetch error:", err.response?.data);
    throw new AppError("Failed to fetch GitHub user info", 500);
  }
};

export {
    buildGoogleAuthUrl,
    buildGithubAuthUrl,
    exchangeGoogleCode,
    exchangeGithubCode,
    getGoogleUserInfo,
    getGithubUserInfo
}