import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  inject,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarDrawerComponent } from '../sidebar-drawer/sidebar-drawer.component';
import * as L from 'leaflet';
import 'leaflet-draw';
import { SatelliteService } from '../../services/satellite.service';
// import 'leaflet-draw/dist/leaflet.draw.css';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MapCalendarComponent } from '../library/map-calendar/map-calendar.component';
import { SharedService } from '../shared/shared.service';
import { MapControllersPopupComponent } from '../../dailogs/map-controllers-popup/map-controllers-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import dayjs from 'dayjs';
(window as any).type = undefined;


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInput,
    HeaderComponent,
    MatSidenavModule,
    SidebarDrawerComponent,
    MapCalendarComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit,OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('drawer') drawer?: MatDrawer;
  map!: L.Map;
  zoomLevel: number = 4;
  longitude: number = -90;
  latitude: number = 40;
  parentZoomLevel: number = 4
  drawLayer!: L.FeatureGroup;
  extraShapesLayer!: L.FeatureGroup;
  vectorLayer!: L.LayerGroup;
  type: string = '';
  private zoomControlEnabled = false;
  private isDarkMode = true;
  private _snackBar = inject(MatSnackBar);
  private drawHandler: any = null; // Declare drawHandler
  private markerHandler: any;
  private darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, // Maximum zoom level
    subdomains: 'abc',
  });
  private lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20, // Maximum zoom level
    subdomains: 'abc',
  });
  googleStreets: L.TileLayer = L.tileLayer(
    'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      maxZoom: 20,
      attribution: '&copy; <a href="https://maps.google.com/">Google Maps</a>',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }
  )
  googlestreetDarkLayer: L.TileLayer = L.tileLayer(
    'http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // 'y' for hybrid layer
    {
      maxZoom: 20,
      attribution: '&copy; <a href="https://maps.google.com/">Google Maps</a>',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }
);


  isGoogleLayerActive: string = 'OpenStreetMapDark'; // Track the current layer
   currentAction: string | null = null; // Tracks the current active action
  private userMarker: L.Marker | null = null; // Store the user marker reference
  private activeDrawTool: L.Draw.Polyline | L.Draw.Polygon | null = null; // Track active drawing tool
  startDate: string ='';
  endDate: string ='';
  data: any;
  @ViewChild(FooterComponent) childComponent!: FooterComponent;
  isDropdownOpen: boolean = false;
  showLayers:boolean = false;
  OpenEventCalendar:boolean=false;
  polygon_wkt:any;
  isDrawerOpen:boolean = false;
  imageOverlay: L.ImageOverlay | undefined;
  polygon:any
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
   private satelliteService:SatelliteService,private dialog: MatDialog,
   private http: HttpClient,
   private sharedService:SharedService,
   private el: ElementRef, private renderer: Renderer2
  )
  {
    this.data = null;
  }

  ngOnInit(): void {
    this.setDynamicHeight();
    window.addEventListener('resize', this.setDynamicHeight.bind(this))
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
    this.sharedService.isOpenedEventCalendar$.subscribe((state) => this.OpenEventCalendar = state);
    this.setDynamicHeight();
    window.addEventListener('resize', this.setDynamicHeight.bind(this))
  }

  //openstreetmap search and location markers function
  onSearchLocation(result: google.maps.places.PlaceResult) {


   
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const lat = result.geometry?.location?.lat()!;
    const lng = result.geometry?.location?.lng()!;
    // Move the map to the searched location
    this.map.setView([lat, lng], this.zoomLevel);

    const markerIcon = L.icon({
      iconUrl: 'assets/svg-icons/pin-location-icon.svg',  // Adjust the path if necessary
      iconSize: [25, 41],  // Adjust the icon size
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    // Add a marker to the map
    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(this.map);
    // Optionally bind a popup to the marker
    marker.bindPopup(`<b>Location:</b> ${result.formatted_address}`).openPopup();
  }

  //openstreetmap initialization
  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [22.5, 112.5], // Initial center, will be updated
      zoom: this.zoomLevel,
      zoomControl: false,
      minZoom: 4, // Set minimum zoom level
      maxZoom: 20, // Set maximum zoom level
      scrollWheelZoom: true, // Optionally allow zooming by scrolling
      dragging: true, // Enable dragging
      worldCopyJump: true,
    });
  
    // Set the bounds for the map to restrict panning and zooming
    // const bounds: L.LatLngBoundsLiteral = [
    //   [-90, -180], // South-west corner (latitude, longitude)
    //   [90, 180],   // North-east corner (latitude, longitude)
    // ];
  
    // Set the max bounds for the map


    // this.map.setMaxBounds(bounds);
  
    // Optional: Prevent zooming out beyond a certain level
    this.map.on('zoomend', () => {
      if (this.map.getZoom() < 4) {
        this.map.setZoom(4);
      }
    });
  
    // Add Tile Layer (Dark mode basemap)
    this.darkLayer.addTo(this.map);
  
    // Initialize the drawing layer
    this.drawLayer = new L.FeatureGroup();
    this.extraShapesLayer = L.featureGroup().addTo(this.map);
    this.map.addLayer(this.drawLayer);
  
    // Initialize and add the vector layer
    this.vectorLayer = L.layerGroup();
    this.vectorLayer.addTo(this.map);
    const polygonCoordinates: L.LatLngExpression[] = [
      [0, 90],   // [latitude, longitude]
      [0, 135],
      [45, 135],
      [45, 90],
      [0, 90],   // Closing the polygon
    ];
  
    // Add polygon to the map
    this.polygon = L.polygon(polygonCoordinates, {
      color: '#66cc66', // Polygon border color
      fillColor: 'rgba(102, 204, 102, 0.5)', // Fill color with opacity
      weight: 2,    // Border thickness
    }).addTo(this.map);
  
    // Calculate the center of the polygon
    const polygonBounds = this.polygon.getBounds();
    const polygonCenter = polygonBounds.getCenter();
  
    // Set the map view to the center of the polygon
    this.map.setView(polygonCenter, this.zoomLevel);
  
    // Add event listener for zoom changes
    this.map.on('zoomend', () => {
      console.log('Zoom changed');
      this.zoomLevel = this.map.getZoom();
    });
    const geoJSON = this.polygon.toGeoJSON();
  
    // Get the bounds of the polygon
    const bounds = this.polygon.getBounds();
  
    // Optionally log to check the output
    console.log('GeoJSON:', geoJSON);
    console.log('Bounds:', bounds);
  
    // Pass the GeoJSON and bounds to your function
    this.getPolygonFromCoordinates({ geometry: geoJSON.geometry }, bounds);
    // Add event listener for mouse movement to track coordinates
    this.map.on('mousemove', (event: L.LeafletMouseEvent) => {
      const coords = event.latlng;
      this.longitude = parseFloat(coords.lng.toFixed(6));
      this.latitude = parseFloat(coords.lat.toFixed(6));
      // Normalize longitude to the range [-180, 180)
      // this.longitude = parseFloat((((coords.lng + 180) % 360 + 360) % 360 - 180).toFixed(6));
    
      // Clamp latitude to the range [-90, 90]
      // this.latitude = parseFloat(Math.max(-90, Math.min(coords.lat, 90)).toFixed(6));
    });
    
  

    this.map.on('move', () => {
      let center = this.map.getCenter();
      let lat = Math.max(-90, Math.min(90, center.lat)); // Clamp latitude
      let lng = center.lng// Allow longitude wrapping
      if (lat !== center.lat) {
          this.map.setView([lat, lng], this.map.getZoom(), { animate: false }); // Reset view if latitude is out of bounds
      }
  });
    // Add event listener for when a shape is created
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.drawLayer.addLayer(layer);
  
      // Optionally handle other types of layers, like storing the GeoJSON of the created feature
      const geoJSON = layer.toGeoJSON();
      console.log('GeoJSON of created feature: ', geoJSON);
    });
  this.map.off('add')
  this.map.off('click')
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const lat = position.coords.latitude;
    //       const lng = position.coords.longitude;
  
    //       // Temporarily allow zooming to user location
    //       this.map.setView([lat, lng], 4, { animate: true });
    //     }
    //   );
    // }
  }
  

  // private addPin(coords: [number, number], iconUrl: string): void {
  //   const customIcon = L.icon({
  //     iconUrl,
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //   });

  //   L.marker(coords, { icon: customIcon }).addTo(this.map);
  // }

  // private addPin(coords: [number, number], iconUrl: string): void {
  //   const customIcon = L.icon({
  //     iconUrl,
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //   });

  //   L.marker(coords, { icon: customIcon }).addTo(this.map);
  // }

  //map zoom in function
  zoomIn(): void {
    const currentZoom = this.map.getZoom();
    if (currentZoom < this.map.getMaxZoom()) {
      this.map.setZoom(currentZoom + 1);
    }
  }

  //map zoom out function
  zoomOut(): void {
    const currentZoom = this.map.getZoom();
    if (currentZoom > this.map.getMinZoom()) {
      this.map.setZoom(currentZoom - 1);
    }
  }

  //Map zoom level setting through slider
  onZoomLevelChange(newZoomLevel: number): void {
    this.parentZoomLevel = newZoomLevel;
    console.log('Zoom level updated in parent:', this.parentZoomLevel);
    this.map.setZoom(this.parentZoomLevel);
  }

  //angular drawer toggle function
  toggleDrawer(): void {
    if (this.drawer) {
      console.log(this.drawer,'drawerdrawerdrawerdrawerdrawerdrawer');
      this.isDrawerOpen = !this.isDrawerOpen
      this.drawer.toggle();
      this.handleDropdownToggle(this.isDrawerOpen)
    }
  }

  //map shape drawing function
  setDrawType(type: any): void {
    console.log("Selected Draw Type:", type);
    this.currentAction = null;

    // Remove existing shapes and event listeners
    if (this.polygon) {
        this.map.off('layeradd');
        this.map.removeLayer(this.polygon);
        this.map.off('click');
        this.drawLayer.clearLayers();
        this.clearExtraShapes();
    }

    // Remove any existing drawing events
    this.map.off(L.Draw.Event.CREATED);
    this.map.off('draw:drawstart'); // Remove tooltip for drawing
    this.map.off('draw:drawstop');

    // Disable any active draw handler
    if (this.drawHandler) {
        this.drawHandler.disable();
        console.log("Previous draw handler disabled.");
    }

    // Clear existing layers
    if (this.drawLayer) {
        this.drawLayer.clearLayers();
        this.clearExtraShapes();
    }

    // Define options for the specific shape type
    let drawHandler: any;

    if (type === 'Polygon') {
        console.log('Starting Polygon drawing...');
        drawHandler = new L.Draw.Polygon(this.map as L.DrawMap, {
            showArea: true,
            shapeOptions: {
                color: '#ff6666',
            },
        });
    } else if (type === 'Circle') {
        console.log('Starting Circle drawing...');
        drawHandler = new L.Draw.Circle(this.map as L.DrawMap, {
            shapeOptions: {
                color: '#3399ff',
            },
        });
    } else if (type === 'Box') {
        console.log('Starting Rectangle (Box) drawing...');
        drawHandler = new L.Draw.Rectangle(this.map as L.DrawMap, {
            shapeOptions: {
                color: '#66cc66',
            },
        });
    }

    if (drawHandler) {
        // Start the drawing process immediately
        drawHandler.enable();
        this.drawHandler = drawHandler; // Store the handler for later use

        // Add an event listener for when the shape is created
        this.map.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer; // The drawn layer
            this.drawLayer.addLayer(layer); // Add to the feature group

            console.log("Drawn Layer Type:", event.layerType);

            if (event.layerType === 'polygon' && type === 'Polygon') {
                const coordinates = (layer as L.Polygon).getLatLngs();
                console.log('Polygon Coordinates:', coordinates);
                const geoJSON = layer.toGeoJSON();
                const bounds = (layer as L.Polygon).getBounds();

                this.getPolygonFromCoordinates({ geometry: geoJSON?.geometry }, bounds);
            } else if (event.layerType === 'circle' && type === 'Circle') {
                const center = (layer as L.Circle).getLatLng();
                const radius = (layer as L.Circle).getRadius();
                console.log('Circle Center:', center);
                console.log('Circle Radius:', radius);
            } else if (event.layerType === 'rectangle' && type === 'Box') {
                const bounds = (layer as L.Rectangle).getBounds();
                console.log('Rectangle Bounds:', bounds);
                const geoJSON = layer.toGeoJSON();
                this.getPolygonFromCoordinates({ geometry: geoJSON?.geometry }, bounds);
            }

            // Disable the draw handler after the shape is created
            drawHandler.disable();
            this.map.off(L.Draw.Event.CREATED); // Remove the event listener
            type = null;

            console.log("Drawing disabled after shape creation.");
        });

        // Add event listener to remove tooltip when drawing starts/stops
        this.map.on('draw:drawstart', () => {
            console.log("Drawing started...");
        });
        this.map.on('draw:drawstop', () => {
            console.log("Drawing stopped...");
        });
    } else {
        console.error("Invalid draw type specified.");
    }
}


  showSatelliteWithinPolygon(bounds: L.LatLngBounds): void {
    // Define the satellite image URL (or any other map layer)
    const satelliteImageUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  
    // Create an image overlay based on the bounds of the polygon
    const imageBounds = bounds; // This is the bounding box of the polygon
    const satelliteLayer = L.imageOverlay(satelliteImageUrl, imageBounds, {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
      opacity: 0.6, // Set the opacity as needed
    });
  
    // Add the satellite layer within the polygon bounds
    satelliteLayer.addTo(this.map);
  }

  getPolygonFromCoordinates(payload:{geometry:{type:string,coordinates:any[]}},bound:any) {
    console.log('aaaaaaaaaaaaaaa');
    
    this.satelliteService.getPolyGonData(payload).subscribe({
      next: (resp) => {
        this.polygon_wkt = resp?.data?.wkt_polygon
        console.log("resp:resp:resp:resp:resp: ", resp?.data);
        if(resp?.data?.area>=100000000){
          this.openSnackbar("Select a smaller polygon");
          
          
        }else {
          if (this.startDate === '' && this.endDate === '') {
            // Start of the previous day
            this.startDate = dayjs().utc().subtract(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
            
            // End of the previous day
            this.endDate = dayjs().utc().subtract(1, 'day').endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
            
            console.log(this.endDate, 'Previous day end date and time');
          }
          let queryParams ={
            page_number: '1',
      page_size: '100',
      start_date:this.startDate,
      end_date: this.endDate
          }
          this.data = resp?.data;
          this.getDataUsingPolygon(resp?.data,queryParams)};
      },
      error: (err) => {
        console.log("err: ", err);
      },
    });
  }



  getDataUsingPolygon(payload: any,queryParams: any) {
    this.satelliteService.getDataFromPolygon(payload,queryParams).subscribe({
      next: (resp) => {
        this.extraShapesLayer?.clearLayers();
        if (Array.isArray(resp?.data)) {
          resp.data.forEach((item:any) => {
            this.addPolygonWithMetadata(item);
          });
        }
      },
      error: (err) => {
        console.log("err getPolyGonData: ", err);
      },
    });
  }
  // Function to add the polygon and its metadata
  private addPolygonWithMetadata(data: any): void {
    const polygonCoordinates = data.coordinates_record.coordinates[0]; // Access the first array of coordinates
  
    // Convert [lng, lat] to [lat, lng] (Leaflet requires [lat, lng] format)
    const latLngs = polygonCoordinates.map((coord: [number, number]) => [
        coord[1],
        coord[0],
    ]);
  
    let color = '#eff24d';
    if (data.vendor_name === 'planet') {
        color = '#55FF00';
    } else if (data.vendor_name === 'blacksky') {
        color = '#FFFF00';
    } else if (data.vendor_name === 'maxar') {
        color = '#FFAA00';
    } else if (data.vendor_name === 'airbus') {
        color = '#0070FF';
    } else if (data.vendor_name === 'skyfi') {
        color = '#A900E6';
    } else {
        color = '#FF00C5';
    }
  
    // Add the polygon to the map
    const polygon = L.polygon(latLngs, {
        color: color, // Border color
        fillColor: color, // Fill color
        fillOpacity: 0.5, // Fill opacity
    }).addTo(this.map);
    console.log(polygon, 'Polygon added');
  
    // Attach the click event to open the component dialog
    polygon.on('click', (event: L.LeafletMouseEvent) => {
        const clickedPosition = event.latlng; // Get the clicked position
  
        // Convert clicked position to pixel position relative to the map
        const containerPoint = this.map.latLngToContainerPoint(clickedPosition);
        let queryParams = {
            page_number: '1',
            page_size: '100',
            start_date: '',
            end_date: '',
            vendor_id: data.vendor_id
        };
        this.satelliteService.getDataFromPolygon('', queryParams).subscribe({
            next: (resp) => {
                console.log(resp, 'Data received');
                const vendorData = resp.data[0];
                this.openDialogAtPosition(polygon, vendorData);
            },
            error: (err) => {
                console.error("Error fetching polygon data: ", err);
            },
        });
    });
  
    // Add the polygon to the extra shapes layer
    this.extraShapesLayer?.addLayer(polygon);
  
    // Explicitly disable the draw handler
    if (this.drawHandler && this.drawHandler._toolbars && this.drawHandler._toolbars.draw) {
        this.drawHandler._toolbars.draw.disable(); // Disables drawing
    }
  
    console.log('Drawing tools disabled');
}

  

  private clearExtraShapes(): void {
    this.extraShapesLayer?.clearLayers();
  }

  private openSnackbar(message:string){
    this._snackBar.open(message, 'Ok', {
      duration: 4000  // Snackbar will disappear after 300 milliseconds
    });
  }


  addCatalogMarker(catalogItem: any): void {
    const { latitude, longitude, vendor_name, type, resolution } = catalogItem;
  
    // Ensure valid geographic data exists
    if (!latitude || !longitude) {
      console.warn("Invalid catalog item, missing coordinates:", catalogItem);
      return;
    }
  
    // Create a marker or another layer type (like a circle)
    const marker = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: 'assets/svg-icons/satellite-icon.svg', // Customize icon if needed
        iconSize: [25, 25], // Adjust size
        iconAnchor: [12, 25], // Anchor point
      }),
    });
  
    // Bind a popup to display catalog details
    marker.bindPopup(`
      <div>
        <strong>Vendor:</strong> ${vendor_name}<br>
        <strong>Type:</strong> ${type}<br>
        <strong>Resolution:</strong> ${resolution}<br>
      </div>
    `);
  
    // Add marker to the map or a specific layer group
    this.vectorLayer.addLayer(marker);
  }
  

  // private addDrawingControls(): void {
  //   const drawControl = new L.Control.Draw({
  //     edit: { featureGroup: this.drawLayer },
  //     draw: {
  //       polygon: {},
  //       circle: {},
  //       rectangle: {},
  //     },
  //   });

  //   this.map.addControl(drawControl);

  //   this.map.on(L.Draw.Event.CREATED, (event:  any) => {
  //     const layer = event.layer;
  //     this.drawLayer.addLayer(layer);

  //     if (event.layerType === 'polygon') {
  //       console.log('Polygon Coordinates:', (layer as L.Polygon).getLatLngs());
  //     } else if (event.layerType === 'circle') {
  //       const circle = layer as L.Circle;
  //       console.log('Circle Center:', circle.getLatLng());
  //       console.log('Circle Radius:', circle.getRadius());
  //     } else if (event.layerType === 'rectangle') {
  //       console.log('Rectangle Bounds:', (layer as L.Rectangle).getBounds());
  //     }
  //   });
  // }

  handleToggleEvent(data: string): void {
    console.log('Received data from child:', data);
    this.type = data;
  }

   //Handles various button actions.
   //* @param action - The type of action to perform.

// Handle user actions with toggle and cleanup
handleAction(action: string): void {
  this.drawLayer.clearLayers();
  if (this.drawHandler && this.drawHandler.enabled()) {
    this.drawHandler.disable(); // Disable the drawing tool
    if (this.drawLayer) {
      this.drawLayer.clearLayers(); // Clear any drawn shapes
      this.clearExtraShapes();
    }
  }
  if (this.currentAction === action) {
    this.deactivateAction(action); // Deactivate the same action if already active
    this.currentAction = null;
    return;
  }

  // Deactivate the previous action if switching to a new one
  if (this.currentAction) {
    this.deactivateAction(this.currentAction);
  }

  this.currentAction = action; // Set the new active action

  // Activate the selected action
  switch (action) {
    case 'location':
      this.locateUser();
      break;
    case 'polygon':
      this.enableDrawing('polygon');
      break;
    case 'line':
      this.enableDrawing('line');
      break;
    case 'settings':
      this.toggleZoomControl();
      break;
    case 'layers':
      this.toggleBaseLayer();
      break;
    default:
      console.error('Invalid action');
      this.currentAction = null;
  }
}

  // Locate user and center the map on their location
  private locateUser(): void {
    this.map.on('click', (event) => {
      const clickLat = event.latlng.lat;
      const clickLng = event.latlng.lng;
  
      // Add a new marker at the clicked location
      const newMarker = L.marker([clickLat, clickLng], {
        icon: L.icon({
          iconUrl: 'assets/svg-icons/pin-location-icon.svg',
          iconSize: [21, 26],
        }),
      }).addTo(this.map);
      
      
      // Bind a popup to the marker that appears when clicked
      newMarker.on('click', () => {
        // Convert lat/lng to screen coordinates
        const mapContainer = this.map.getContainer();
        const markerPoint = this.map.latLngToContainerPoint({ lat: clickLat, lng: clickLng });
      
        // Default dialog position
        let position = {
          top: `${markerPoint.y + mapContainer.offsetTop}px`,
          left: `${markerPoint.x + mapContainer.offsetLeft + 20}px`,
        };

      const  payload= {
        latitude:clickLat,
        longitude:clickLng,
        distance:1
      }
      this.satelliteService.getPinSelectionAnalytics(payload).subscribe({
        next: (resp) => {
          console.log(resp,'resprespresprespresprespresp');
          if(resp){
           
            
            const markerData = resp?.data?.analytics
            this.getAddress(clickLat, clickLng).then((address) => {
              const dialogRef = this.dialog.open(MapControllersPopupComponent, {
                width: '320px',
                data: { type: 'marker', markerData:markerData,pointData:payload },
                position,
                panelClass: 'custom-dialog-class',
              });
          
              // After dialog opens, measure and adjust position
              dialogRef.afterOpened().subscribe(() => {
                const dialogElement = document.querySelector('.custom-dialog-class') as HTMLElement;
          
                if (dialogElement) {
                  const dialogHeight = dialogElement.offsetHeight;
                  const mapHeight = mapContainer.offsetHeight;
                  const mapWidth = mapContainer.offsetWidth;
          
                  // Adjust horizontal position (left or right)
                  let newLeft = markerPoint.x + mapContainer.offsetLeft + 20;
                  if (markerPoint.x + 300 > mapWidth) {
                    newLeft = markerPoint.x + mapContainer.offsetLeft - 300 - 20; // Move to the left
                  }
          
                  // Adjust vertical position (top or bottom)
                  let newTop: number;
                  const spaceAboveMarker = markerPoint.y; // Space available above the marker
                  const spaceBelowMarker = mapHeight - markerPoint.y; // Space available below the marker
          
                  if (spaceBelowMarker >= dialogHeight + 20) {
                    // Position dialog below the marker if enough space is available
                    newTop = markerPoint.y + mapContainer.offsetTop + 10; // Add small margin below marker
                  } else if (spaceAboveMarker >= dialogHeight + 20) {
                    // Position dialog above the marker if enough space is available
                    newTop = markerPoint.y + mapContainer.offsetTop - dialogHeight - 10; // Subtract margin above marker
                  } else {
                    // Default fallback: align the dialog vertically centered around the marker
                    newTop = Math.max(
                      mapContainer.offsetTop,
                      Math.min(markerPoint.y + mapContainer.offsetTop - dialogHeight / 2, mapHeight - dialogHeight)
                    );
                  }
    
                  console.log(newTop,'newTopnewTopnewTopnewTop');
                  
                  // Update dialog position dynamically
                  dialogRef.updatePosition({
                    top: `${newTop}px`,
                    left: `${newLeft}px`,
                  });
                }
              });
            });
          }
          // if (Array.isArray(resp?.data)) {
          //   resp.data.forEach((item:any) => {
          //     this.addPolygonWithMetadata(item);
          //   });
          // }
        },
        error: (err) => {
          console.log("err getPolyGonData: ", err);
        },
      });
        // Fetch address and open the dialog
       
      });
      
    });
  }
  
  
  
  
  async getAddress(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    try {
      const response: any = await this.http.get(url).toPromise();
      return response.display_name || 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Error fetching address';
    }
  }
  

  // Enable drawing mode for polygons or lines
  private enableDrawing(shape: string): void {
    // Clear previous layers
    this.drawLayer.clearLayers();
    
    // If there's an active drawing tool, disable it before starting a new one
    if (this.activeDrawTool) {
      this.activeDrawTool.disable();
    }
  
    let drawTool: L.Draw.Polyline | L.Draw.Polygon;
  
    if (shape === 'polygon') {
      drawTool = new L.Draw.Polygon(this.map as L.DrawMap, {
        shapeOptions: {
          color: '#ff7800',
          weight: 4,
        },
      });
    } else if (shape === 'line') {
      drawTool = new L.Draw.Polyline(this.map as L.DrawMap, {
        shapeOptions: {
          color: '#1f78b4',
          weight: 4,
        },
        maxPoints: 2,
      });
    } else {
      console.error('Invalid shape type');
      return;
    }
  
    // Enable the draw tool
    drawTool.enable();
    this.activeDrawTool = drawTool;
  
    // Remove any previous event listeners for 'L.Draw.Event.CREATED'
    this.map.off(L.Draw.Event.CREATED);
  
    // Add the event listener for the new shape
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
  
      // Log to check how many times the event is being triggered
      console.log('Event triggered: ', shape, new Date().toISOString());
  
      if (shape === 'line' && layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs();
        if (latlngs.length === 2) {
          this.drawLayer.addLayer(layer);
        }
      } else if (shape === 'polygon') {
        this.drawLayer.addLayer(layer);
        const bounds = (layer as L.Polygon).getBounds();
        const center = bounds.getCenter();
        const geoJSON = layer.toGeoJSON();
        const payload = { geometry: geoJSON?.geometry };
        let shapeData 
        if (geoJSON.geometry.coordinates.length <= 5) {
          shapeData = {
            coordinates: geoJSON.geometry.coordinates,
            type: 'Rectangle',
          };
        } else {
          shapeData = {
            coordinates: geoJSON.geometry.coordinates,
            type: 'Polygon',
          };
        }
        // API call to get polygon data
        this.satelliteService.getPolyGonData(payload).subscribe({
          next: (resp) => {
            console.log(resp, 'Polygon Data Response');
            this.polygon_wkt = resp?.data?.wkt_polygon
            const data = { polygon_wkt: resp.data.wkt_polygon };
            if (resp.data) {
              // API call for polygon selection analytics
              this.satelliteService.getPolygonSelectionAnalytics(data).subscribe({
                next: (res) => {
                  console.log(res, 'Polygon Selection Analytics Response');
                  if (res.data) {
                    // No need for layer.once() here, just use layer.on('click', ...)
                    layer.on('click', async (e: L.LeafletEvent) => {
                      const mapContainer = this.map.getContainer();
                      const boundsNorthEast = this.map.latLngToContainerPoint(bounds.getNorthEast());
                      const boundsSouthWest = this.map.latLngToContainerPoint(bounds.getSouthWest());
  
                      // Set the dialog position near the top-right of the polygon
                      const polygonPoint = {
                        x: boundsNorthEast.x,
                        y: boundsSouthWest.y,
                      };
  
                      const position = {
                        top: `${polygonPoint.y + mapContainer.offsetTop}px`,
                        left: `${polygonPoint.x + mapContainer.offsetLeft + 20}px`,
                      };
  
                      // Mock data for dialog content (replace with actual data if needed)
                      const markerData = res?.data?.analytics;
                      this.getAddress(center.lat, center.lng).then((address) => {
                        const dialogRef = this.dialog.open(MapControllersPopupComponent, {
                          width: '320px',
                          data: { type: 'polygon', markerData: markerData, shapeData: shapeData },
                          position,
                          panelClass: 'custom-dialog-class',
                        });
  
                        dialogRef.afterOpened().subscribe(() => {
                          const dialogElement = document.querySelector('.custom-dialog-class') as HTMLElement;
  
                          if (dialogElement) {
                            const dialogHeight = dialogElement.offsetHeight;
                            const mapHeight = mapContainer.offsetHeight;
                            const mapWidth = mapContainer.offsetWidth;
  
                            let newLeft = polygonPoint.x + mapContainer.offsetLeft + 20;
                            if (polygonPoint.x + 300 > mapWidth) {
                              newLeft = polygonPoint.x + mapContainer.offsetLeft - 300 - 20;
                            }
  
                            let newTop: number;
                            const spaceAbove = polygonPoint.y;
                            const spaceBelow = mapHeight - polygonPoint.y;
  
                            if (spaceBelow >= dialogHeight + 20) {
                              newTop = polygonPoint.y + mapContainer.offsetTop + 10;
                            } else if (spaceAbove >= dialogHeight + 20) {
                              newTop = polygonPoint.y + mapContainer.offsetTop - dialogHeight - 10;
                            } else {
                              newTop = Math.max(
                                mapContainer.offsetTop,
                                Math.min(polygonPoint.y + mapContainer.offsetTop - dialogHeight / 2, mapHeight - dialogHeight)
                              );
                            }
  
                            dialogRef.updatePosition({
                              top: `${newTop}px`,
                              left: `${newLeft}px`,
                            });
                          }
                        });
                      });
                    });
                  }
                },
              });
            }
          },
          error: (err) => {
            console.error('Error fetching polygon data:', err);
          },
        });
      }
    });
  }
  
  
  
  
  
  
  // Helper function to calculate the centroid of a polygon
  // private getCentroid(latLngs: L.LatLng[]): L.LatLng {
  //   let latSum = 0;
  //   let lngSum = 0;
  
  //   // Log latLngs to ensure valid data
  //   console.log('Polygon coordinates:', latLngs);
  
  //   latLngs.forEach(latLng => {
  //     if (latLng instanceof L.LatLng) {
  //       console.log('Valid LatLng:', latLng);  // Check if latLng is an instance of L.LatLng
  
  //       // Make sure latLng has valid lat and lng values
  //       if (latLng.lat && latLng.lng) {
  //         latSum += latLng.lat;
  //         lngSum += latLng.lng;
  //       } else {
  //         console.warn('Invalid LatLng object (missing lat/lng):', latLng);
  //       }
  //     } else {
  //       console.warn('Non-LatLng object in latLngs:', latLng);
  //     }
  //   });
  
  //   const length = latLngs.length;
  
  //   // Check if there are valid LatLngs
  //   if (length === 0 || latSum === 0 || lngSum === 0) {
  //     console.error('Invalid LatLng data for centroid calculation');
  //     return L.latLng(0, 0); // Return default invalid LatLng if centroid calculation fails
  //   }
  
  //   // Calculate and return the centroid
  //   return L.latLng(latSum / length, lngSum / length);
  // }

  // Toggle zoom controls on the map
  private toggleZoomControl(): void {
    console.log(this.zoomControlEnabled,'zoomControlEnabledzoomControlEnabledzoomControlEnabled');
    
    if (this.zoomControlEnabled) {
      this.map.removeControl(this.map.zoomControl);
     
    } else {
      this.map.addControl(L.control.zoom({ position: 'topright' }));
      
    }
    this.zoomControlEnabled = !this.zoomControlEnabled;
  }

  // Toggle between dark and light mode layers
  private toggleBaseLayer(): void {
    if (this.isDarkMode) {
      this.map.removeLayer(this.darkLayer);
      this.lightLayer.addTo(this.map);
      alert('Switched to light mode.');
    } else {
      this.map.removeLayer(this.lightLayer);
      this.darkLayer.addTo(this.map);
      alert('Switched to dark mode.');
    }
    this.isDarkMode = !this.isDarkMode;
  }

  //Deactivating map actions
  private deactivateAction(action: string): void {
    switch (action) {
      case 'location':
        this.clearUserMarker();
        break;
      case 'polygon':
      case 'line':
        this.disableDrawing();
        break;
      case 'settings':
        // Optionally reset zoom controls
        break;
      case 'layers':
        // No specific cleanup for layers
        break;
      default:
        console.error('Invalid action to deactivate');
    }
  }
  
  //Disable map drawings control
  private disableDrawing(): void {
    console.log(this.activeDrawTool, 'Disabling drawing tool');

    // Check if a drawing tool is currently active
    if (this.activeDrawTool) {
        // Disable the active drawing tool
        this.activeDrawTool.disable();
        this.activeDrawTool = null;  // Clear the reference to the active tool
    }
}


//Clear map location marker action
private clearUserMarker(): void {
  this.map.off('click')
  if (this.userMarker) {
    this.map.removeLayer(this.userMarker); // Remove the marker from the map
    this.userMarker = null; // Reset the reference
  }

  // Reset maxZoom to the original map configuration
  this.map.options.maxZoom = 20;

  // Optionally reset the zoom level to your default zoom
  if (this.zoomLevel > 20) {
    this.map.setZoom(20); // Adjust zoom if it exceeds maxZoom
  }
}

toggleMapLayer(type:string) {
  this.isGoogleLayerActive = type
  if (this.isGoogleLayerActive ==='OpenStreetMapLight') {
    // Remove Google Streets layer and add Dark Layer
    this.map.removeLayer(this.googleStreets);
    this.map.removeLayer(this.darkLayer)
    this.map.removeLayer(this.googlestreetDarkLayer)
    this.lightLayer.addTo(this.map);
  } else if(this.isGoogleLayerActive === 'OpenStreetMapDark') {
    // Remove Dark Layer and add Google Streets layer
    this.map.removeLayer(this.googleStreets);
    this.map.removeLayer(this.lightLayer)
    this.map.removeLayer(this.googlestreetDarkLayer)
    this.darkLayer.addTo(this.map);
  }else if(this.isGoogleLayerActive === 'GoogleStreetMapLight') {
    // Remove Dark Layer and add Google Streets layer
    this.map.removeLayer(this.darkLayer);
    this.map.removeLayer(this.lightLayer)
    this.map.removeLayer(this.googlestreetDarkLayer)
    this.googleStreets.addTo(this.map);
  } else {
    this.map.removeLayer(this.darkLayer);
    this.map.removeLayer(this.lightLayer)
    this.map.removeLayer(this.googleStreets)
    this.googlestreetDarkLayer.addTo(this.map);
  }
  
}

onDateRangeChanged(event: { startDate: string, endDate: string }) {
  const formattedStartDate = dayjs(event.startDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
  const formattedENdDate = dayjs(event.endDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
  this.startDate = formattedStartDate;
  this.endDate = formattedENdDate;
  console.log('Start Date:', this.startDate);
  console.log('End Date:', this.endDate);

  if (this.data) {
    let queryParams ={
      page_number: '1',
      page_size: '100',
      start_date:this.startDate,
      end_date: this.endDate
    }
  this.getDataUsingPolygon(this.data,queryParams);
  }

}

// Handle the dropdown toggle event from the child
handleDropdownToggle(state: boolean) {
  this.showLayers = false
  this.isDropdownOpen = state;
}

handleLayersToggle(state:boolean){
  this.isDropdownOpen = false
  this.showLayers = state;
}

closeDropdown() {
  console.log('aaaaaaaaaa');
  
  this.isDropdownOpen = false;
  this.showLayers = false
}

//open map controller pop up
openDialog(data: any, position: { top: string; left: string }): void {
  
  this.dialog.open(MapControllersPopupComponent, {
    width: '300px',
    data: data,
    position: position, // Dynamically calculated position
  });
}

// Method to open the dialog at a specific position
private openDialogAtPosition(polygon: any, metadata: any): void {
  const bounds = polygon.getBounds();
  const mapContainer = this.map.getContainer();
  const boundsNorthEast = this.map.latLngToContainerPoint(bounds.getNorthEast());
  const boundsSouthWest = this.map.latLngToContainerPoint(bounds.getSouthWest());

  const dialogWidth = 272; // Dialog's fixed width
  const dialogHeight = 200; // Dialog's approximate height
  const offset = 10; // Small padding to avoid overlap

  let position: { top: string; left: string };

  // Check if zoom level is greater than 8
  if (this.zoomLevel > 8) {
    // Center the dialog on the screen
    const centerX = mapContainer.offsetWidth / 2 - dialogWidth / 2;
    const centerY = mapContainer.offsetHeight / 2 - dialogHeight / 2;

    position = {
      top: `70px`,
      left: `${centerX + mapContainer.offsetLeft}px`,
    };
  } else {
    // Set the dialog position near the top-right of the polygon
    const polygonPoint = {
      x: boundsNorthEast.x,
      y: boundsSouthWest.y,
    };

    position = {
      top: `${polygonPoint.y + mapContainer.offsetTop - 150}px`,
      left: `${polygonPoint.x + mapContainer.offsetLeft + 20}px`,
    };
    console.log(polygonPoint.y,'polygonPointpolygonPointpolygonPointpolygonPointpolygonPoint',mapContainer.offsetTop);
    
  }

  // Open the dialog with the calculated position
  const dialogRef = this.dialog.open(MapControllersPopupComponent, {
    width: `${dialogWidth}px`,
    height: 'auto',
    data: { type: 'vendor', vendorData: metadata },
    position,
    panelClass: 'custom-dialog-class',
  });

  // Re-adjust dialog position dynamically after opening if zoom level <= 8
  if (this.zoomLevel <= 8) {
    dialogRef.afterOpened().subscribe(() => {
      const dialogElement = document.querySelector('.custom-dialog-class') as HTMLElement;

      if (dialogElement) {
        const dialogHeight = dialogElement.offsetHeight;
        const mapHeight = mapContainer.offsetHeight;
        const mapWidth = mapContainer.offsetWidth;

        const polygonPoint = {
          x: boundsNorthEast.x,
          y: boundsSouthWest.y,
        };

        let newLeft = polygonPoint.x + mapContainer.offsetLeft + 20;
        if (polygonPoint.x + 300 > mapWidth) {
          newLeft = polygonPoint.x + mapContainer.offsetLeft - 300 - 20;
        }

        let newTop: number;
        const spaceAbove = polygonPoint.y;
        const spaceBelow = mapHeight - polygonPoint.y;

        if (spaceBelow >= dialogHeight + 20) {
          console.log(polygonPoint.y,'kkkkkkkkkkk',mapContainer.offsetTop);
          
          newTop = polygonPoint.y + mapContainer.offsetTop ;
        } else if (spaceAbove >= dialogHeight + 20) {
          console.log('bbbbbbbbbbbb');
          
          newTop = polygonPoint.y + mapContainer.offsetTop - dialogHeight - 40;
        } else {
          console.log('ttttttttttttt');
          
          newTop = Math.max(
            mapContainer.offsetTop,
            Math.min(polygonPoint.y + mapContainer.offsetTop - dialogHeight / 2, mapHeight - dialogHeight - 20)
          );
        }

        dialogRef.updatePosition({
          top: `${newTop}px`,
          left: `${newLeft}px`,
        });
      }
    });
  }

  dialogRef.afterClosed().subscribe((result) => {
    console.log('Dialog closed', result);
  });
}

receiveData(data: any) {
  console.log(data, 'parentparentparentparentparentparentparent');

  // Check if coordinates exist
  if (data?.coordinates_record?.coordinates) {
    // Extract the coordinates and map them to Leaflet's LatLng format
    const coordinates = data.coordinates_record.coordinates[0].map((coord: number[]) => 
      new L.LatLng(coord[1], coord[0]) // Convert [lon, lat] to [lat, lon]
    );

    // Calculate bounds from the coordinates
    const bounds = new L.LatLngBounds(coordinates);

    // Remove any existing overlay
    if (this.imageOverlay) {
      this.map.removeLayer(this.imageOverlay);
    }

    // Create and add the image overlay to the map
    this.imageOverlay = L.imageOverlay(data.presigned_url, bounds, {
      opacity: 1, // Optional: Adjust opacity if needed
      zIndex:1000,
    });
    this.imageOverlay.addTo(this.map);

    // Fit the map view to the overlay bounds (optional)
    this.map.fitBounds(bounds);

    // Add a polygon overlay to visualize the shape (optional)
    L.polygon(coordinates, { color: 'red', weight: 2 }).addTo(this.map);
  } else {
    if (this.imageOverlay) {
      this.map.removeLayer(this.imageOverlay);
      this.map.setZoom(4)
    }
  }
}

setDynamicHeight(): void {
  // Get the height of the elements above
  const header = document.getElementById('header');

  
  // Calculate the total height of all the above elements
  const totalHeight = [
    header,
   
  ].reduce((acc, el) => acc + (el ? el.offsetHeight : 0), 0);

  // Get the height of the viewport
  const viewportHeight = window.innerHeight;

  // Calculate the remaining height for the target div
  const remainingHeight = viewportHeight - totalHeight;

  // Get the content div and apply the calculated height
  const contentDiv = this.el.nativeElement.querySelector('.library');
  if (contentDiv) {
    this.renderer.setStyle(contentDiv, 'height', `${remainingHeight}px`);
  }
}
ngOnDestroy(): void {
  window.removeEventListener('resize', this.setDynamicHeight.bind(this));  // Clean up event listener
}

}
