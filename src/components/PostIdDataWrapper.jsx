import React from "react";

function Reaction() {
    return (
        <div className="reaction-wrapper">
            <video
                src="https://www.facebook.com/reel/24674433478812298/?s=ifu&__cft__[0]=AZVnEXsdlWHhEnzqt_4evWewz3j0vTf2HLW_Ku3B94BHq_WIGbQVuHxcR7rlWDyd0AqYEqg96hvJ1x20V42cfK2cQbYBfn3njWb5wOvS2DguOVKou0u6Y2CUnPgeUfbNNrVd8R2rWd04f6r7DywNgqrRzq0Ht9kISN5CPL_nwGpYqLI0lyUrVT4UmzeSmTg7arxJ84_4pXxw4pu5f36j7iMx"
                controls
                width="600"
                height="400"
                style={{ backgroundColor: "#000" }} // fallback background
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default Reaction;

