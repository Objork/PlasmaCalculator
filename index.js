
const convertBtn = document.getElementById("convertBtn");
const chargedParticleEl = document.getElementById("chargedParticle");
const densityEl = document.getElementById("eDensity");
const temperatureEl = document.getElementById("tElec");
const bFieldEl = document.getElementById("bField");
const vBulkEl = document.getElementById("vBulk");

const magneticConstant = 1.25663706e-6;
const electronMass = 9.10938215e-31;
const elementaryCharge = 1.60217649e-19;
const boltzmannConstant = 1.38065042e-23;
const vacuumPermit = 8.85418782e-12;
const protonMass = 1.67262192e-27;

convertBtn.addEventListener("click", function () {
  let chargedParticle = chargedParticleEl.value;
  let density = parseFloat(densityEl.value);
  let temperature = parseFloat(temperatureEl.value);
  let bField = parseFloat(bFieldEl.value);
  let vBulk = parseFloat(vBulkEl.value);

  if (chargedParticle === "electron") {
    let alfven = bField / (Math.sqrt(magneticConstant * density * electronMass));
    let debye = Math.sqrt((vacuumPermit * boltzmannConstant * temperature) / (density * (elementaryCharge ** 2)));
    let gyroRadius = (electronMass * vBulk) / (elementaryCharge * bField);
    let plasmaFreq = Math.sqrt((density * (elementaryCharge ** 2)) / (vacuumPermit * electronMass));
    let angularFreq = (elementaryCharge * bField) / electronMass;
    let gyrotime = (2 * Math.PI) / ((elementaryCharge * bField) / electronMass);
    let thermalVelo = Math.sqrt((2 * boltzmannConstant * temperature) / electronMass);
    let sonicMach=vBulk/thermalVelo;
    let alfvenMach=vBulk/alfven;

    // Update the output fields with the calculated values
    document.getElementById("i1").value = alfven.toExponential(4);
    document.getElementById("i2").value = debye.toExponential(4);
    document.getElementById("i3").value = gyroRadius.toExponential(4);
    document.getElementById("i4").value = plasmaFreq.toExponential(4);
    document.getElementById("i5").value = angularFreq.toExponential(4);
    document.getElementById("i6").value = gyrotime.toExponential(4);
    document.getElementById("i7").value = thermalVelo.toExponential(4);
    document.getElementById("i8").value=sonicMach.toExponential(4);
    document.getElementById("i9").value=alfvenMach.toExponential(4);

  } else if (chargedParticle === "proton") {
    let alfven = bField / (Math.sqrt(magneticConstant * density * protonMass));
    let debye = Math.sqrt((vacuumPermit * boltzmannConstant * temperature) / (density * (elementaryCharge ** 2)));
    let gyroRadius = (protonMass * vBulk) / (elementaryCharge * bField);
    let plasmaFreq = Math.sqrt((density * (elementaryCharge ** 2)) / (vacuumPermit * protonMass));
    let angularFreq = (elementaryCharge * bField) / protonMass;
    let gyrotime = (2 * Math.PI) / ((elementaryCharge * bField) / protonMass);
    let thermalVelo = Math.sqrt((2 * boltzmannConstant * temperature) / protonMass);
    let sonicMach=vBulk/thermalVelo;
    let alfvenMach=vBulk/alfven;

    // Update the output fields with the calculated values
    document.getElementById("i1").value = alfven.toExponential(4);
    document.getElementById("i2").value = debye.toExponential(4);
    document.getElementById("i3").value = gyroRadius.toExponential(4);
    document.getElementById("i4").value = plasmaFreq.toExponential(4);
    document.getElementById("i5").value = angularFreq.toExponential(4);
    document.getElementById("i6").value = gyrotime.toExponential(4);
    document.getElementById("i7").value = thermalVelo.toExponential(4);
    document.getElementById("i8").value=sonicMach.toExponential(4);
    document.getElementById("i9").value=alfvenMach.toExponential(4);
  } else {
    // If charged particle is not selected, set all results to 0
    document.getElementById("i1").value = "0";
    document.getElementById("i2").value = "0";
    document.getElementById("i3").value = "0";
    document.getElementById("i4").value = "0";
    document.getElementById("i5").value = "0";
    document.getElementById("i6").value = "0";
    document.getElementById("i7").value = "0";
    document.getElementById("i8").value="0";
    document.getElementById("i9").value="0";
  }
});

 //end of calculation


 // this function hides all the planet input divs but only shows selected one.





 
 function enableBrand(selectedOption){
  if(selectedOption.value==1){
    document.getElementById("mercuryDiv").classList.remove('noneMercury')
    document.getElementById("venusDiv").classList.add('noneVenus')
    document.getElementById("earthDiv").classList.add('noneEarth')
    document.getElementById("marsDiv").classList.add('noneMars')
    document.getElementById("jupiterDiv").classList.add('noneJupiter')
    document.getElementById("saturnDiv").classList.add('noneSaturn')
    document.getElementById("uranusDiv").classList.add('noneUranus')
    document.getElementById("neptuneDiv").classList.add('noneNeptune')        
}

else if(selectedOption.value==2){
  document.getElementById("venusDiv").classList.remove('noneVenus')
  document.getElementById("mercuryDiv").classList.add('noneMercury')
  document.getElementById("earthDiv").classList.add('noneEarth')
  document.getElementById("marsDiv").classList.add('noneMars')
  document.getElementById("jupiterDiv").classList.add('noneJupiter')
  document.getElementById("saturnDiv").classList.add('noneSaturn')
  document.getElementById("uranusDiv").classList.add('noneUranus')
  document.getElementById("neptuneDiv").classList.add('noneNeptune')        
}
   else if(selectedOption.value==3){
        document.getElementById("earthDiv").classList.remove('noneEarth')
        document.getElementById("mercuryDiv").classList.add('noneMercury')
        document.getElementById("venusDiv").classList.add('noneVenus')
        document.getElementById("marsDiv").classList.add('noneMars')
        document.getElementById("jupiterDiv").classList.add('noneJupiter')
        document.getElementById("saturnDiv").classList.add('noneSaturn')
        document.getElementById("uranusDiv").classList.add('noneUranus')
        document.getElementById("neptuneDiv").classList.add('noneNeptune')        
    }
    else if(selectedOption.value==4){
        document.getElementById("marsDiv").classList.remove('noneMars')
        document.getElementById("mercuryDiv").classList.add('noneMercury')
        document.getElementById("venusDiv").classList.add('noneVenus')
        document.getElementById("earthDiv").classList.add('noneEarth')
        document.getElementById("jupiterDiv").classList.add('noneJupiter')
        document.getElementById("saturnDiv").classList.add('noneSaturn')
        document.getElementById("uranusDiv").classList.add('noneUranus')
        document.getElementById("neptuneDiv").classList.add('noneNeptune')
    }
    else if(selectedOption.value==5){
        document.getElementById("jupiterDiv").classList.remove('noneJupiter')
        document.getElementById("mercuryDiv").classList.add('noneMercury')
        document.getElementById("venusDiv").classList.add('noneVenus')
        document.getElementById("earthDiv").classList.add('noneEarth')
        document.getElementById("marsDiv").classList.add('noneMars')
        document.getElementById("saturnDiv").classList.add('noneSaturn')
        document.getElementById("uranusDiv").classList.add('noneUranus')
        document.getElementById("neptuneDiv").classList.add('noneNeptune')
    }
    else if(selectedOption.value==6){
      document.getElementById("saturnDiv").classList.remove('noneSaturn')
      document.getElementById("mercuryDiv").classList.add('noneMercury')
      document.getElementById("venusDiv").classList.add('noneVenus')
      document.getElementById("earthDiv").classList.add('noneEarth')
      document.getElementById("marsDiv").classList.add('noneMars')
      document.getElementById("jupiterDiv").classList.add('noneJupiter')
      document.getElementById("uranusDiv").classList.add('noneUranus')
      document.getElementById("neptuneDiv").classList.add('noneNeptune')
    }
    else if(selectedOption.value==7){
        document.getElementById("uranusDiv").classList.remove('noneUranus')
        document.getElementById("mercuryDiv").classList.add('noneMercury')
        document.getElementById("venusDiv").classList.add('noneVenus')
        document.getElementById("earthDiv").classList.add('noneEarth')
        document.getElementById("marsDiv").classList.add('noneMars')
        document.getElementById("jupiterDiv").classList.add('noneJupiter')
        document.getElementById("saturnDiv").classList.add('noneSaturn')
        document.getElementById("neptuneDiv").classList.add('noneNeptune')
      }
    else if(selectedOption.value==8){
        document.getElementById("neptuneDiv").classList.remove('noneNeptune')
        document.getElementById("mercuryDiv").classList.add('noneMercury')
        document.getElementById("venusDiv").classList.add('noneVenus')
        document.getElementById("earthDiv").classList.add('noneEarth')
        document.getElementById("marsDiv").classList.add('noneMars')
        document.getElementById("jupiterDiv").classList.add('noneJupiter')
        document.getElementById("saturnDiv").classList.add('noneSaturn')
        document.getElementById("uranusDiv").classList.add('noneUranus')
    }

 }