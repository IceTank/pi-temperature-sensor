window.onload = function() {
  console.log('Load');
  fetch('/thermalNow', {
    methode: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    const p = document.getElementById('thermalNow');
    p.innerText = data;
  });
}
