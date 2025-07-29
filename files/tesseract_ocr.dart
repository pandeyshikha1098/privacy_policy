import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart';
import 'package:tesseract_ocr/ocr_engine_config.dart'; // Import OCRConfig

class TesseractOcr {
  static const String TESS_DATA_CONFIG = 'assets/tessdata_config.json';
  // Adjusted path to potentially fix asset loading duplication on some platforms
  static const String TESS_DATA_PATH = 'assets/tessdata';
  static const MethodChannel _channel = const MethodChannel('tesseract_ocr');

  static Future<String> extractText(
    String imagePath, {
    OCRConfig? config, // Add optional OCRConfig parameter
  }) async {
    assert(await File(imagePath).exists(), true);

    // Use config if provided, otherwise create a default config
    final actualConfig = config ?? const OCRConfig();

    // If using Tesseract engine, ensure tessData is loaded
    String? tessDataPath;
    if (actualConfig.engine != OCREngine.vision) {
      // Check if NOT Vision
      tessDataPath = await _loadTessData();
    }

    // Build the arguments map
    final Map<String, dynamic> args = {
      'imagePath': imagePath,
      'tessData': tessDataPath,
      'language': actualConfig.language,
    };

    final String extractedText = await _channel.invokeMethod(
      'extractText',
      args,
    );

    return extractedText;
  }

  static Future<String> _loadTessData() async {
    final Directory appDirectory = await getApplicationDocumentsDirectory();
    final String tessdataDirectory = join(appDirectory.path, 'tessdata');

    if (!await Directory(tessdataDirectory).exists()) {
      await Directory(tessdataDirectory).create();
    }
    await _copyTessDataToAppDocumentsDirectory(tessdataDirectory);
    return appDirectory.path;
  }

  static Future _copyTessDataToAppDocumentsDirectory(
    String tessdataDirectory,
  ) async {
    final String config = await rootBundle.loadString(TESS_DATA_CONFIG);
    Map<String, dynamic> files = jsonDecode(config);
    for (var file in files["files"]) {
      //final assetPath = join(TESS_DATA_PATH, file);
      if (!await File(join(tessdataDirectory, file)).exists()) {
        // Also use join for destination path existence check
        final ByteData? data = await loadFileFromAppData(file);
        if (data == null) {
          print("❌ Failed to load $file from app data.");
          throw Exception("Failed to load $file from app data.");
        }
        // await rootBundle.load(
        //   assetPath,
        // ); // Use the variable
        final Uint8List bytes = data.buffer.asUint8List(
          data.offsetInBytes,
          data.lengthInBytes,
        );
        await File(
          join(tessdataDirectory, file),
        ).writeAsBytes(bytes); // Use join for destination path writing
      }
    }
  }

  static Future<ByteData?> loadFileFromAppData(String filename) async {
    // Get the application's document directory
    final Directory appDocDir = await getApplicationDocumentsDirectory();

    // Build full file path
    final String filePath = '${appDocDir.path}/$filename';

    // Read the file as bytes
    final File file = File(filePath);

    if (await file.exists()) {
      final Uint8List bytes = await file.readAsBytes();
      return ByteData.view(bytes.buffer);
    } else {
      return null;
    }
  }
}
