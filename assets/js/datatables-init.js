// DataTables initialization for journals CSV data
document.addEventListener('DOMContentLoaded', function () {
    // Only initialize DataTable if the journals table exists
    const journalsTable = document.getElementById('journals-table');
    if (journalsTable) {
        console.log('Journals table found, loading CSV data...');

        // Parse CSV data and populate table
        fetch('/data/journals.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('CSV data loaded:', data);

                const rows = data.split('\n').filter(row => row.trim() !== '');
                if (rows.length === 0) {
                    throw new Error('No data found in CSV file');
                }

                const headers = rows[0].split(',').map(header => header.trim());
                const tableData = rows.slice(1).map(row => {
                    // Handle CSV with potential commas in quoted fields
                    const cells = [];
                    let current = '';
                    let inQuotes = false;

                    for (let i = 0; i < row.length; i++) {
                        const char = row[i];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            cells.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    cells.push(current.trim()); // Don't forget the last cell

                    return cells;
                });

                console.log('Parsed table data:', tableData);

                // Generate table headers dynamically
                const thead = journalsTable.querySelector('thead tr');
                thead.innerHTML = ''; // Clear existing headers
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    thead.appendChild(th);
                });

                // Clear any existing tbody content
                const tbody = journalsTable.querySelector('tbody');
                tbody.innerHTML = '';

                // Populate table with data
                tableData.forEach(rowData => {
                    if (rowData.length >= headers.length) { // Ensure we have data for all columns
                        const tr = document.createElement('tr');
                        // Use all available columns, not just first 4
                        for (let i = 0; i < headers.length; i++) {
                            const td = document.createElement('td');
                            td.textContent = rowData[i] || ''; // Handle missing data gracefully
                            tr.appendChild(td);
                        }
                        tbody.appendChild(tr);
                    }
                });

                console.log('Table populated, initializing DataTable...');

                // Generate dynamic column definitions based on number of columns
                const columnDefs = [];
                const columnWidth = Math.floor(100 / headers.length); // Distribute width evenly

                for (let i = 0; i < headers.length; i++) {
                    columnDefs.push({
                        targets: [i],
                        width: `${columnWidth}%`,
                        className: "text-wrap"
                    });
                }

                // Initialize DataTable
                $('#journals-table').DataTable({
                    responsive: false, // Disable responsive mode to allow text wrapping
                    scrollX: false, // Disable horizontal scrolling
                    pageLength: 25,
                    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                    order: [[0, 'asc']], // Sort by first column by default
                    columnDefs: columnDefs,
                    language: {
                        search: "Search journals:",
                        lengthMenu: "Show _MENU_ journals per page",
                        info: "Showing _START_ to _END_ of _TOTAL_ journals",
                        infoEmpty: "Showing 0 to 0 of 0 journals",
                        infoFiltered: "(filtered from _MAX_ total journals)",
                        paginate: {
                            first: "First",
                            last: "Last",
                            next: "Next",
                            previous: "Previous"
                        }
                    }
                });

                console.log('DataTable initialized successfully!');
            })
            .catch(error => {
                console.error('Error loading journals data:', error);
                // Fallback: show error message in table (use existing headers or create a single column)
                const thead = journalsTable.querySelector('thead tr');
                const existingHeaders = thead.querySelectorAll('th');
                const colSpan = existingHeaders.length > 0 ? existingHeaders.length : 1;

                const tbody = journalsTable.querySelector('tbody');
                tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center text-red-500 p-4">Error loading journals data. Please try again later.</td></tr>`;
            });
    } else {
        console.log('Journals table not found on this page');
    }
});
