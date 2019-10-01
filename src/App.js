import React from "react";
import Viz from "./viz";
import Data from "./data";
import Controls from "./controls";
function App() {
  return (
    <div>
      <Data>
        {(props) => {
          return (
            <Controls
              {...props}
            />
          );
        }}
      </Data>
    </div>
  );
}

export default App;
