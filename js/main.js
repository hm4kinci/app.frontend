var settings = {
    organization_id: 1
}
var sample_tasks = [[
    '21 Jan: Phond John S about signing them up for phrase 2 of Project Alpha',
    '26 February: Emailed Matt abut signing them up for phrase 2 of Project Black',
    '1/10/2020: Calld Jane to see what she thinks on the latest offer of Project Theta',
    'Jan 21st: Meeting with Paul to demo new features of  Project Beta'
],
[
    '3 Oct 2020: Emailed Matt to set up a meeting to review latest revision of the agreement of Red',
    'Oct 3: Met with Joe for the Project Green',
    '10 May: Skyped Ben to catch up on Yellow',
    '30 Jan: emailed Ian the latest presentation of Project Black'
]];

$(document).ready(function () {
    let task_template = document.getElementById('task_template').innerHTML;
    let projects_template = document.getElementById('projects_template').innerHTML;
    let members_template = document.getElementById('members_template').innerHTML;
    let sample_task_template = document.getElementById('sample_task_template').innerHTML;

    //workaround
    var serviceUrl =  'http://' + window.location.hostname + ':5000/'

    function loadOrganizationData(){
        var payload = {
            'body': $('#txtRequestBody').val(),
            'organization_id': settings.organization_id
        }

        var output = Mustache.render(sample_task_template, {'sample_tasks': sample_tasks[settings.organization_id-1]});
        $('#cmbSampleTasks').html(output);

        try{
            $.ajax({
                type: 'GET',
                url: serviceUrl + 'projects',
                data: payload,
                dataType: 'json',
                success: function(result){
                    if(result.success){
                        var output = Mustache.render(projects_template, {'projects': result.data});
                        $('#pnlProjects').html(output);
                    }
                    else{
                        $('#pnlProjects').html('unable to load projects');
                    }
                }
            });
        }
        catch(err){
            $('#pnlProjects').html('unable to load projects');
        }

        try{
            $.ajax({
                type: 'GET',
                url: serviceUrl + 'members',
                data: payload,
                dataType: 'json',
                success: function(result){
                    if(result.success){
                        var output = Mustache.render(members_template, {'members': result.data});
                        $('#pnlMembers').html(output);
                    }
                    else{
                        $('#pnlMembers').html('unable to load members');
                    }
                }
            });
        }
        catch(err){
            $('#pnlMembers').html('unable to load members');
        }
        
    }
    

    $('#cmbOrganization').on('change', function() {
        settings.organization_id = this.value;
        loadOrganizationData();
    });

    $('#cmbSampleTasks').on('change', function() {
        $('#txtRequestBody').val(this.value);
    });

    $("#btnSave").click(function (e) {
        var payload = {
            'body': $('#txtRequestBody').val(),
            'organization_id': settings.organization_id
        }
        $.ajax({
            type: 'GET',
            url: serviceUrl + 'tasks/process',
            data: payload,
            dataType: 'json',
            success: function(result){
                let log;
                data = result.data;
                if(result.success){

                    if(typeof(data.dates)!=='undefined' && 
                        data.dates != null &&
                        Array.isArray(data.dates)
                    ){
                        for(i in data.dates){
                            data.dates[i].format_date = formatDate;
                        }
                    }

                    var output = Mustache.render(task_template, data);
                    $('#console').prepend($("<li class='list-group-item text-info'>").html(output));
                }
                else{
                    log = data
                    $('#console').prepend($("<li class='list-group-item response-error'>").text(log));
                }
            }
          });

        return false;
    });

    function formatDate(){
        return function(value, render){
            return '<i>' + moment(render(value), "YYYY-MM-DDThh:mm:ss").format("LL") + '</i>'
        }
    }

    loadOrganizationData();

});