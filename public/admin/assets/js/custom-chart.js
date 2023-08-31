(function ($) {
    "use strict";
   
    
    let Jan = document.getElementById('Jan').value
    let Feb = document.getElementById('Feb').value
    let Mar = document.getElementById('Mar').value
    let Apr = document.getElementById('Apr').value
    let May = document.getElementById('May').value
    let Jun = document.getElementById('Jun').value
    let Jul = document.getElementById('Jul').value
    let Aug = document.getElementById('Aug').value
    let Sep = document.getElementById('Sep').value
    let Oct = document.getElementById('Oct').value
    let Nov = document.getElementById('Nov').value
    let Dec = document.getElementById('Dec').value
    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Users',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(4, 209, 130, 0.2)',
                        borderColor: 'rgb(4, 209, 130)',
                        data: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
                    },

                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if

})(jQuery);