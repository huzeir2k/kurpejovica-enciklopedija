<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Header -->
<header class="bg-light">
    <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3">
            <!-- Logo or Site Name -->
            <a class="navbar-brand" href="{{ route('home') }}">
                kurpejovica enciklopedija
            </a>

            <!-- Search Bar -->
            <form class="form-inline my-2 my-lg-0">
                <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
                <button class="btn btn-outline-primary my-2 my-sm-0" type="submit">Search</button>
            </form>

            <!-- Login Button -->
            <a href="{{ route('login') }}" class="btn btn-primary ml-2">Login</a>
        </div>
    </div>
</header>


<!-- Bootstrap JS Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
